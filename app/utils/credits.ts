import { FREE_CREDITS } from '@/lib/constants'
import { Polar } from '@polar-sh/sdk'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})

// Atomically decrement key if current value >= amount
const ATOMIC_DECRBY = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local amount = tonumber(ARGV[1])
if current >= amount then
  redis.call('DECRBY', KEYS[1], amount)
  return 1
end
return 0
`

// Atomically increment usage counter if (max - used) >= amount
const ATOMIC_INCR_USAGE = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
local max_credits = tonumber(ARGV[1])
local amount = tonumber(ARGV[2])
if (max_credits - used) >= amount then
  redis.call('INCRBY', KEYS[1], amount)
  return 1
end
return 0
`

// How long (seconds) to remember a Polar spend that the meter — which is
// eventually consistent — may not reflect yet.
const POLAR_PENDING_TTL_SECONDS = 90
// Max wall-clock (ms) to wait for the per-user spend lock before giving up.
const LOCK_TTL_MS = 5000
const LOCK_RETRIES = 5
const LOCK_RETRY_DELAY_MS = 100

class Credits {
  private redis: Redis
  private polar: Polar
  private welcomeCredits = FREE_CREDITS
  private meterId = process.env.POLAR_CREDIT_METER!

  constructor() {
    this.redis = redis
    this.polar = polar
  }

  private getUserKey(userId: string) {
    return `welcome_credits:${userId}`
  }

  private getRefundKey(userId: string) {
    return `refund_credits:${userId}`
  }

  private getPolarPendingKey(userId: string) {
    return `polar_pending:${userId}`
  }

  private getLockKey(userId: string) {
    return `credits_lock:${userId}`
  }

  private async acquireLock(userId: string): Promise<boolean> {
    const lockKey = this.getLockKey(userId)
    for (let attempt = 0; attempt < LOCK_RETRIES; attempt++) {
      const acquired = await this.redis.set(lockKey, '1', {
        nx: true,
        px: LOCK_TTL_MS,
      })
      if (acquired === 'OK') return true
      await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY_MS))
    }
    return false
  }

  private async releaseLock(userId: string) {
    await this.redis.del(this.getLockKey(userId))
  }

  private async getNonPolarCredits(userId: string) {
    const [welcomeUsed, refunds] = await this.redis.mget<
      [number | null, number | null]
    >(this.getUserKey(userId), this.getRefundKey(userId))

    const welcomeCredits = Math.max(this.welcomeCredits - (welcomeUsed || 0), 0)
    const refundCredits = refunds || 0

    return {
      welcome: welcomeCredits,
      refund: refundCredits,
      total: welcomeCredits + refundCredits,
    }
  }

  private async getPolarCredits(userId: string) {
    const result = await this.polar.customers.getStateExternal({
      externalId: userId,
    })
    const meters = result.activeMeters
    const meter = meters.find((m) => m.meterId === this.meterId)

    if (!meter) return 0

    return meter.balance || 0
  }

  // Polar's meter balance is eventually consistent, so a recent spend may not
  // be reflected yet. Subtract any pending (recorded-but-maybe-unreflected)
  // spends so we never authorize more than the customer actually has.
  private async getAvailablePolarCredits(userId: string) {
    const [balance, pending] = await Promise.all([
      this.getPolarCredits(userId),
      this.redis.get<number>(this.getPolarPendingKey(userId)),
    ])
    return Math.max(balance - (pending || 0), 0)
  }

  async get(userId?: string) {
    if (!userId) return 0

    const [nonPolar, polar] = await Promise.all([
      this.getNonPolarCredits(userId),
      this.getAvailablePolarCredits(userId).catch((error) => {
        console.error('Failed to get Polar credits:', error)
        return 0
      }),
    ])

    return nonPolar.total + polar
  }

  async decrement(userId: string, amount: number = 1) {
    // Atomically try refund credits first
    const refundResult = await this.redis.eval<[number], number>(
      ATOMIC_DECRBY,
      [this.getRefundKey(userId)],
      [amount]
    )
    if (refundResult === 1) return true

    // Atomically try welcome credits
    const welcomeResult = await this.redis.eval<[number, number], number>(
      ATOMIC_INCR_USAGE,
      [this.getUserKey(userId)],
      [this.welcomeCredits, amount]
    )
    if (welcomeResult === 1) return true

    // Paid (Polar) credits: check-then-spend is not atomic against Polar's
    // eventually consistent meter, so serialize per user with a short lock and
    // account for in-flight spends. This prevents concurrent requests from all
    // reading the same balance and overspending a single paid credit.
    const locked = await this.acquireLock(userId)
    if (!locked) return false

    try {
      const available = await this.getAvailablePolarCredits(userId)
      if (available < amount) return false

      await this.polar.events.ingest({
        events: [
          {
            name: 'icon-generation',
            externalCustomerId: userId,
          },
        ],
      })

      // Record the spend so a rapid follow-up sees the reduced balance until
      // Polar's meter catches up.
      const pendingKey = this.getPolarPendingKey(userId)
      await this.redis.incrby(pendingKey, amount)
      await this.redis.expire(pendingKey, POLAR_PENDING_TTL_SECONDS)

      return true
    } finally {
      await this.releaseLock(userId)
    }
  }

  async increment(userId: string, amount: number = 1) {
    // Add to refund credits when there's an error
    await this.redis.incrby(this.getRefundKey(userId), amount)
    return true
  }
}

export const credits = new Credits()

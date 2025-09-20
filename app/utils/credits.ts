import { FREE_CREDITS } from '@/lib/constants'
import { Polar } from '@polar-sh/sdk'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})

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
    try {
      const result = await this.polar.customers.getStateExternal({
        externalId: userId,
      })
      const meters = result.activeMeters
      console.log(meters)
      const meter = meters.find((m) => m.meterId === this.meterId)

      if (!meter) return 0

      return meter.balance || 0
    } catch (error) {
      console.error('Failed to get Polar credits:', error)
      return 0
    }
  }

  async get(userId?: string) {
    if (!userId) return 0

    const [nonPolar, polar] = await Promise.all([
      this.getNonPolarCredits(userId),
      this.getPolarCredits(userId),
    ])

    return nonPolar.total + polar
  }

  async decrement(userId: string, amount: number = 1) {
    const nonPolar = await this.getNonPolarCredits(userId)

    // First try refund credits
    if (nonPolar.refund >= amount) {
      await this.redis.decrby(this.getRefundKey(userId), amount)
      return true
    }

    // Then try welcome credits
    if (nonPolar.welcome >= amount) {
      await this.redis.incrby(this.getUserKey(userId), amount)
      return true
    }

    // Finally try Polar credits
    const polarCredits = await this.getPolarCredits(userId)
    if (polarCredits >= amount) {
      try {
        await this.polar.events.ingest({
          events: [
            {
              name: 'icon-generation',
              externalCustomerId: userId,
            },
          ],
        })
        return true
      } catch (error) {
        console.error('Failed to decrement Polar credits:', error)
        return false
      }
    }

    return false
  }

  async increment(userId: string, amount: number = 1) {
    // Add to refund credits when there's an error
    await this.redis.incrby(this.getRefundKey(userId), amount)
    return true
  }
}

export const credits = new Credits()

import { FREE_CREDITS } from '@/lib/constants'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

class Credits {
  private redis: Redis
  private freeCredits = FREE_CREDITS
  private timezone = 'America/New_York'

  constructor() {
    this.redis = redis
  }

  private getDayKey(userId: string) {
    const today = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())

    return `credits:${userId}:${today}`
  }

  /**
   * Gets the number of remaining free credits for a user for the current day.
   * Returns a number between 0 and dailyFreeCredits, based on how many credits
   * have been used so far today.
   */
  async get(userId: string) {
    const key = this.getDayKey(userId)
    const used = (await this.redis.get<number>(key)) || 0
    return Math.max(this.freeCredits - used, 0)
  }

  async decrement(userId: string, amount: number = 1) {
    const key = this.getDayKey(userId)
    const available = await this.get(userId)

    if (available < amount) {
      return false
    }

    await this.redis.incrby(key, amount)
    return true
  }

  async increment(userId: string, amount: number = 1) {
    const key = this.getDayKey(userId)
    await this.redis.incrby(key, amount)
  }
}

export const credits = new Credits()

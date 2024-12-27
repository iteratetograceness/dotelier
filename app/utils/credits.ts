import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

class Credits {
  private redis: Redis
  private dailyFreeCredits = 3
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

  async get(userId: string) {
    const key = this.getDayKey(userId)
    const used = (await this.redis.get<number>(key)) || 0
    return Math.max(this.dailyFreeCredits - used, 0)
  }

  async decrement(userId: string, amount: number = 1) {
    const key = this.getDayKey(userId)
    const used = await this.get(userId)
    const available = this.dailyFreeCredits - used

    if (available < amount) {
      return false
    }

    await this.redis.incrby(key, amount)
    return true
  }
}

export const credits = new Credits()

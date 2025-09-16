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

  private async getWelcomeCredits(userId: string) {
    const used = (await this.redis.get<number>(this.getUserKey(userId))) || 0
    return Math.max(this.welcomeCredits - used, 0)
  }

  private async getPolarCredits(userId: string) {
    try {
      const result = await this.polar.customers.getStateExternal({
        externalId: userId,
      })
      const meters = result.activeMeters
      const meter = result.activeMeters.find((m) => m.meterId === this.meterId)

      if (!meter) {
        console.error('Failed to find credit meter in Polar!')
        return 0
      }

      return meter.balance || 0
    } catch (error) {
      console.error('Failed to get Polar credits:', error)
      return 0
    }
  }

  async get(userId: string, customerId?: string) {
    const welcomeCredits = await this.getWelcomeCredits(userId)

    if (welcomeCredits > 0) {
      return welcomeCredits
    }

    if (customerId) {
      return this.getPolarCredits(customerId)
    }

    return 0
  }

  async decrement(userId: string, amount: number = 1) {
    const welcomeCredits = await this.getWelcomeCredits(userId)

    if (welcomeCredits >= amount) {
      await this.redis.incrby(this.getUserKey(userId), amount)
      return true
    }

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
}

export const credits = new Credits()

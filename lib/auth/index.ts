import { polar, portal, usage, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { admin, jwt } from 'better-auth/plugins'
import { getBaseUrl } from '../base-url'
import { db } from '../db/pg'
import { redis } from '../redis'

export const client = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})

export const auth = betterAuth({
  appName: 'Dotelier Studio',
  baseUrl: getBaseUrl(),
  database: {
    db,
    type: 'postgres',
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key)
      return value ? JSON.stringify(value) : null
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl })
      } else {
        await redis.set(key, value)
      }
    },
    delete: async (key) => {
      await redis.del(key)
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          id: user.id,
        }),
      },
      schema: {
        jwks: {
          fields: {
            publicKey: 'publicKey',
            privateKey: 'privateKey',
            createdAt: 'createdAt',
          },
        },
      },
    }),
    admin(),
    polar({
      client,
      createCustomerOnSignUp: true,
      use: [
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onCustomerCreated: async (payload) => {
            try {
              // await client.meters.update({
              //   meterSlug: 'icon-generations',
              //   customerId: payload.data.external_id,
              //   result: 3,
              // })
            } catch (error) {
              console.error('Error ingesting event', error)
            }
          },
        }),
      ],
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 11 * 60,
    },
  },
})

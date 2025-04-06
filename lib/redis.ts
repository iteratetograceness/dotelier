import { Redis } from '@upstash/redis'

if (!process.env.KV_REST_API_URL) {
  throw new Error('Missing Upstash URL')
}

if (!process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing Upstash token')
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

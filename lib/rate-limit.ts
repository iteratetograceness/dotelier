'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

/**
 * Rate limiter for pixel generation.
 * Allows 5 requests per minute per fingerprint/IP.
 */
export const generateRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1m'),
  prefix: 'ratelimit:generate',
  analytics: true,
})

/**
 * Get the best identifier for rate limiting.
 * Prefers JA4 fingerprint (catches bots rotating IPs), falls back to IP.
 */
export function getRateLimitIdentifier(headers: Headers): string {
  return (
    headers.get('x-vercel-ja4-digest') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

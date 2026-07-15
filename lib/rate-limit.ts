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
 *
 * Preference order, most-trusted first:
 *  1. JA4 fingerprint — set by Vercel's edge, catches bots rotating IPs.
 *  2. `x-real-ip` — set by Vercel's proxy to the true client IP; unlike the
 *     leftmost `x-forwarded-for` token, a client cannot spoof it to mint a
 *     fresh identifier per request and bypass the limit.
 *  3. Leftmost `x-forwarded-for` — last-resort fallback for non-Vercel
 *     environments; spoofable, so only used when nothing better is present.
 */
export function getRateLimitIdentifier(headers: Headers): string | null {
  return (
    headers.get('x-vercel-ja4-digest') ??
    headers.get('x-real-ip')?.trim() ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  )
}

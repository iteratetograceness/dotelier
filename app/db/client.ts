import { createClient } from 'edgedb'
import createAuth from './auth/index'
// import createAuth from '@edgedb/auth-nextjs/app'

export const db = createClient()

const baseUrl =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_ENV === 'preview'
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

export const auth = createAuth(db, {
  baseUrl,
  authCookieName: 'sesh',
  pkceVerifierCookieName: 'pkce',
})

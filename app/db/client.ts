import { createClient } from 'edgedb'
import createAuth from '@edgedb/auth-nextjs/app'

export const db = createClient()

export const auth = createAuth(db, {
  baseUrl: process.env.VERCEL_URL || 'http://localhost:3000',
  authCookieName: 'sesh',
  pkceVerifierCookieName: 'pkce',
})

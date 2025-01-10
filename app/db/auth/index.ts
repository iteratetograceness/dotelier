import { cache } from 'react'
import { cookies } from 'next/headers'
import { Client } from 'edgedb'
import { OAuthOptions } from './shared/client'
import { OAuth, OAuthSession } from './shared/server'

export class Auth extends OAuth {
  getSession = cache(async () => {
    const cookieStore = await cookies()
    const authCookieName = this.options.authCookieName ?? 'sesh'
    return new OAuthSession(
      this.client,
      cookieStore.get(authCookieName)?.value.split(';')[0] ?? null
    )
  })
}

export default function createAuth(client: Client, options: OAuthOptions) {
  return new Auth(client, options)
}

'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { auth } from '.'

export const getSession = cache(
  async (
    {
      asResponse,
      disableCookieCache,
    }: {
      asResponse: boolean
      disableCookieCache: boolean
    } = {
      asResponse: false,
      disableCookieCache: false,
    }
  ) => {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse,
      query: {
        disableCookieCache,
      },
    })
    return session
  }
)

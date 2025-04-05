'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { auth } from '.'

export const getSession = cache(async (asResponse: boolean = false) => {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse,
  })
  return session
})

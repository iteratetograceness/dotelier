import { createAuthClient } from 'better-auth/react'
import { getBaseUrl } from '../base-url'

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
})

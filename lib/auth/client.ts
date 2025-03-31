import { createAuthClient } from 'better-auth/react'
import { getBaseUrl } from '../base-url'

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
})

export const signInWithGoogle = ({
  callbackURL = '/',
  errorCallbackURL = '/',
  newUserCallbackURL,
  disableRedirect = false,
}: {
  callbackURL?: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  disableRedirect?: boolean
} = {}) => {
  return authClient.signIn.social({
    provider: 'google',
    callbackURL,
    errorCallbackURL,
    newUserCallbackURL,
    disableRedirect,
  })
}

export const { signOut, useSession } = authClient

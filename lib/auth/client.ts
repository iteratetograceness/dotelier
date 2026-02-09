import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { getBaseUrl } from '../base-url'

const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [adminClient()],
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

export async function checkout({ products }: { products: string[] }) {
  const res = await fetch(`${getBaseUrl()}/api/auth/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ products }),
  })

  if (!res.ok) {
    throw new Error('Checkout failed')
  }

  const data = await res.json()

  if (data.url) {
    window.location.href = data.url
  }
}

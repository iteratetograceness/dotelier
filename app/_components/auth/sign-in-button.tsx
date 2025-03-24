'use client'

import { authClient } from '@/lib/auth/client'
import { Button } from '../button'

export function SignInButton({ text = 'Sign in' }: { text?: string }) {
  return (
    <Button
      onClick={async () => {
        await authClient.signIn.social({
          provider: 'google',
        })
      }}
    >
      {text}
    </Button>
  )
}

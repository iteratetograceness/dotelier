'use client'

import { signInWithGoogle } from '@/lib/auth/client'
import { Button } from '../button'

export function SignInButton({ text = 'Sign in' }: { text?: string }) {
  return <Button onClick={() => signInWithGoogle()}>{text}</Button>
}

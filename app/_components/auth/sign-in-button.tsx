'use client'

import { signInWithGoogle } from '@/lib/auth/client'
import { Button, ButtonProps } from '../button'

export function SignInButton({
  text = 'Sign in',
  className,
  variant = 'primary',
  type = 'button',
}: {
  text?: string
  className?: string
  variant?: ButtonProps['variant']
  type?: ButtonProps['type']
}) {
  return (
    <Button
      onClick={() => signInWithGoogle()}
      className={className}
      variant={variant}
      type={type}
    >
      {text}
    </Button>
  )
}

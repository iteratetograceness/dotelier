'server-only'

import { headers } from 'next/headers'
import { auth } from '.'

interface AuthResult {
  success: true
  user: {
    id: string
    email: string
  }
  jwt?: string
}

interface AuthError {
  success: false
  error: string
}

export async function authorizeRequest({
  withJwt = false,
}: {
  withJwt?: boolean
} = {}): Promise<AuthResult | AuthError> {
  const headersList = await headers()
  const result = await auth.api.getSession({
    headers: headersList,
    asResponse: withJwt,
  })

  if (!result) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }

  if (result instanceof Response) {
    const jwt = result.headers.get('set-auth-jwt')
    const body = await result.json()
    return {
      success: true,
      user: {
        id: body.user.id,
        email: body.user.email,
      },
      jwt,
    }
  }

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
  }
}

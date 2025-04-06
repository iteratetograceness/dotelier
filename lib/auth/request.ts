'server-only'

import { getSession } from './session'

interface AuthResult {
  success: true
  user: {
    id: string
    email: string
    role?: string | null
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
  const result = await getSession({
    asResponse: withJwt,
    disableCookieCache: withJwt,
  })

  if (!result) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }

  if (result instanceof Response) {
    const jwt = result.headers.get('set-auth-jwt') ?? undefined
    const body = await result.json()
    return {
      success: true,
      user: {
        id: body.user.id,
        email: body.user.email,
        role: body.user.role,
      },
      jwt,
    }
  }

  return {
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
  }
}

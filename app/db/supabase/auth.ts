'server-only'

import { ERROR_CODES } from '@/lib/error'
import { createClient } from './server'

interface AuthorizedRequest {
  success: true
  user: {
    id: string
  }
}

interface UnauthorizedRequest {
  success: false
  error: number
}

export async function authorizeRequest(): Promise<
  AuthorizedRequest | UnauthorizedRequest
> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (!user) {
      console.error(
        '[authorizeRequest]: ',
        error || 'Failed to authorize request'
      )
      return {
        success: false,
        error: ERROR_CODES.UNAUTHORIZED,
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
      },
    }
  } catch (error) {
    console.error('[authorizeRequest]: ', error)

    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
    }
  }
}

'use server'

export interface FormState {
  url?: string
  error?: string
}

import { auth } from '../db/client'

export async function generate(previousState: FormState, formData: FormData) {
  const session = auth.getSession()
  const isSignedIn = await session.isSignedIn()

  if (!isSignedIn) {
    return {
      error: 'You must be signed in to generate an icon',
    }
  }

  if (!formData.get('prompt')) {
    return {
      error: 'Input is required',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/pixelate`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if ('error' in data) {
    return {
      error: data.error,
    }
  }

  if (
    'images' in data &&
    Array.isArray(data.images) &&
    data.images.length > 0
  ) {
    return {
      url: data.images[0].url,
    }
  }

  return {
    error: 'Failed to generate icon. Please try again.',
  }
}

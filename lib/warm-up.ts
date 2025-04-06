import { headers } from 'next/headers'
import { WARM_PIXEL_API_URL } from './constants'

export async function warmupServer() {
  if (process.env.NODE_ENV === 'development') return

  try {
    console.log('Warming up server...')
    const res = await fetch(WARM_PIXEL_API_URL, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`,
        Origin: (await headers()).get('Origin') ?? 'https://dotelier.studio',
      },
    })

    if (!res.ok) {
      const data = await res.text()
      throw new Error(data)
    }
  } catch (err) {
    console.warn('Warmup failed:', err)
  }
}

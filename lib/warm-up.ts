import { headers } from 'next/headers'
import { WARM_PIXEL_API_URL } from './constants'

let isWarm = false

export async function warmupServer() {
  if (isWarm) {
    console.log('Server is already warm')
    return
  }

  try {
    console.log('Warming up server...')
    const res = await fetch(WARM_PIXEL_API_URL, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`,
        Origin: (await headers()).get('Origin') ?? 'https://dotelier.studio',
      },
    })

    if (res.ok) isWarm = true
    else {
      const data = await res.text()
      throw new Error(data)
    }
  } catch (err) {
    console.warn('Warmup failed:', err)
  }
}

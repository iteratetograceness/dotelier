declare global {
  interface Window {
    EyeDropper?: {
      new (): {
        open: (options?: {
          signal?: AbortSignal
        }) => Promise<{ sRGBHex: string }>
      }
    }
  }
}

import { EyeDropperPolyfill } from './polyfill'

export async function openEyeDropper(canvas?: HTMLCanvasElement | null) {
  if (!window) return

  if ('EyeDropper' in window && window.EyeDropper) {
    const native = new window.EyeDropper()
    return native.open()
  }

  if (!canvas) return

  const fallback = new EyeDropperPolyfill(canvas)
  return fallback.open()
}

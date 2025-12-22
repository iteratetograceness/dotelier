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

  // Try native EyeDropper first
  if ('EyeDropper' in window && window.EyeDropper) {
    try {
      const native = new window.EyeDropper()
      return await native.open()
    } catch {
      // Native EyeDropper failed, fall through to polyfill
    }
  }

  // Fall back to canvas-based polyfill
  if (!canvas) return

  const fallback = new EyeDropperPolyfill(canvas)
  return fallback.open()
}

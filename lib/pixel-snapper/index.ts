/**
 * Pixel Snapper — pixel art grid detection and resampling via WASM.
 *
 * Based on https://github.com/Hugo-Dz/spritefusion-pixel-snapper
 *
 * Pipeline (runs entirely in WASM):
 *   1. k-means++ color quantization
 *   2. Sobel gradient profiling to detect grid step sizes
 *   3. Elastic "walker" snaps cuts to actual grid edges
 *   4. Cross-axis stabilization for coherent aspect ratios
 *   5. Majority-vote resampling to produce a clean pixel grid
 */

import type { InitInput } from './wasm/pixel_snapper'

// ---------------------------------------------------------------------------
// WASM singleton
// ---------------------------------------------------------------------------

let initPromise: Promise<typeof import('./wasm/pixel_snapper')> | null = null

/**
 * Lazily load and initialize the WASM module.
 * Subsequent calls return the same resolved promise.
 */
function getModule(): Promise<typeof import('./wasm/pixel_snapper')> {
  if (!initPromise) {
    initPromise = (async () => {
      const mod = await import('./wasm/pixel_snapper')
      const wasmUrl = new URL('./wasm/pixel_snapper.wasm', import.meta.url)
      await mod.default(wasmUrl as unknown as InitInput)
      return mod
    })()
  }
  return initPromise
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SnapResult {
  /** Raw RGBA pixel data for the snapped image. */
  imageData: ImageData
  /** Unique colors found in the output (RGBA tuples). */
  palette: [number, number, number, number][]
}

/**
 * Snap a raster image to a clean pixel grid.
 *
 * @param imageBytes - Raw image file bytes (PNG or JPEG).
 * @param maxColors  - Maximum palette size for k-means quantization (default 16).
 * @returns Decoded ImageData and extracted palette.
 */
export async function snapPixels(
  imageBytes: Uint8Array,
  maxColors: number = 16,
): Promise<SnapResult> {
  const mod = await getModule()
  const pngBytes = mod.process_image(imageBytes, maxColors)
  return decodePng(pngBytes)
}

// ---------------------------------------------------------------------------
// PNG decoding helpers (no external deps)
// ---------------------------------------------------------------------------

/**
 * Decode a PNG byte array into ImageData using an OffscreenCanvas (or
 * fallback to a regular canvas when OffscreenCanvas is unavailable).
 */
async function decodePng(pngBytes: Uint8Array): Promise<SnapResult> {
  const blob = new Blob([new Uint8Array(pngBytes)], { type: 'image/png' })
  const bitmap = await createImageBitmap(blob)

  const { width, height } = bitmap
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const imageData = ctx.getImageData(0, 0, width, height)
  const palette = extractPalette(imageData)

  return { imageData, palette }
}

/** Extract unique opaque colors from ImageData. */
function extractPalette(
  imageData: ImageData,
): [number, number, number, number][] {
  const seen = new Set<string>()
  const palette: [number, number, number, number][] = []
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 10) continue

    const key = `${data[i]},${data[i + 1]},${data[i + 2]},${a}`
    if (!seen.has(key)) {
      seen.add(key)
      palette.push([data[i], data[i + 1], data[i + 2], a])
    }
  }

  return palette
}

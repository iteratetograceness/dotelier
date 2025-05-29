import { Color } from './renderer'

export function analyzeGridCell({
  quantizedData,
  width,
  startX,
  startY,
  regionSize,
  alphaThreshold,
}: {
  quantizedData: Uint8Array | number[]
  width: number
  startX: number
  startY: number
  regionSize: number
  alphaThreshold: number
}): {
  filledPixels: number
  totalPixels: number
  colorMap: Map<string, { count: number; color: Color }>
} {
  const colorMap = new Map<string, { count: number; color: Color }>()
  const intStartX = Math.floor(startX)
  const intStartY = Math.floor(startY)
  const intRegion = Math.floor(regionSize)

  let filledPixels = 0
  const totalPixels = intRegion * intRegion

  for (let dy = 0; dy < intRegion; dy++) {
    for (let dx = 0; dx < intRegion; dx++) {
      const px = intStartX + dx
      const py = intStartY + dy

      if (px >= width || py >= width || px < 0 || py < 0) continue

      const idx = (py * width + px) * 4

      const r = quantizedData[idx]
      const g = quantizedData[idx + 1]
      const b = quantizedData[idx + 2]
      const a = quantizedData[idx + 3]

      if (a > alphaThreshold) {
        filledPixels++
        const color: Color = [r, g, b, 255]
        const key = color.join(',')

        if (colorMap.has(key)) {
          const existing = colorMap.get(key)!
          existing.count++
        } else {
          colorMap.set(key, { count: 1, color })
        }
      }
    }
  }

  return { totalPixels, filledPixels, colorMap }
}

export function findDominantColor(
  colorMap: Map<string, { count: number; color: Color }>
): Color | null {
  let dominantColor: Color | null = null
  let maxCount = 0
  for (const entry of Array.from(colorMap.values())) {
    if (entry.count > maxCount) {
      maxCount = entry.count
      dominantColor = entry.color
    }
  }
  return dominantColor
}

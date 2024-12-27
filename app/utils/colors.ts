export interface ColorResult {
  rgb: {
    r: number
    g: number
    b: number
  }
  hex: string
}

export type ColorMap = Map<number, ColorResult>

function encodeRgb(rgb: { r: number; g: number; b: number }) {
  return `${rgb.r}/${rgb.g}/${rgb.b}`
}

export function encodeColors(colors: ColorMap) {
  return Array.from(colors.values())
    .map((color) => `${encodeRgb(color.rgb)}`)
    .join(',')
}

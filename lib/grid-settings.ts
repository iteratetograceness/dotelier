/**
 * Grid settings for pixel art processing.
 * This file is shared between client and server code.
 */

export interface GridSettings {
  /** Max palette colors for raster→pixel snapping (k-means). */
  maxColors?: number
  /** Alpha threshold for SVG rasterization (0–255). */
  alphaThreshold?: number
  /** Minimum fill percentage for SVG grid cells (0–100). */
  fillThreshold?: number
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  maxColors: 16,
  alphaThreshold: 128,
  fillThreshold: 61,
}

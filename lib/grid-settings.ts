/**
 * Grid settings for pixel art processing.
 * This file is shared between client and server code.
 */

export interface GridSettings {
  /** Max palette colors for raster→pixel snapping (k-means). */
  maxColors?: number
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  maxColors: 16,
}

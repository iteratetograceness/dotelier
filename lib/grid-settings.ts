/**
 * Grid settings for pixel art processing.
 * This file is shared between client and server code.
 */

export interface GridSettings {
  downscaleMethod?:
    | 'dominant'
    | 'median'
    | 'mode'
    | 'mean'
    | 'nearest'
    | 'content-adaptive'
  maxColors?: number
  alphaThreshold?: number
  fillThreshold?: number
  snapGrid?: boolean
  cleanup?: { morph?: boolean; jaggy?: boolean }
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  downscaleMethod: 'dominant',
  maxColors: 32,
  alphaThreshold: 128,
  fillThreshold: 61,
  snapGrid: true,
  cleanup: { morph: false, jaggy: true },
}

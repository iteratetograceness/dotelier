/**
 * Configuration options for unfake image processing.
 * These map to the processImage function parameters.
 */
export interface UnfakeSettings {
  /** Maximum number of colors in the palette (2-256). Default: 32 */
  maxColors: number
  /** Automatically detect optimal color count. Default: false */
  autoColorCount: boolean
  /** Downscaling algorithm to use. Default: 'dominant' */
  downscaleMethod:
    | 'dominant'
    | 'median'
    | 'mode'
    | 'mean'
    | 'nearest'
    | 'content-adaptive'
  /** Scale detection method. Default: 'auto' */
  detectMethod: 'auto' | 'runs' | 'edge'
  /** Edge detection algorithm variant. Default: 'tiled' */
  edgeDetectMethod: 'tiled' | 'legacy'
  /** Threshold for dominant color selection (0.01-0.5). Default: 0.15 */
  domMeanThreshold: number
  /** Manual scale override. null = auto-detect */
  manualScale: number | null
  /** Apply morphological cleanup to reduce noise. Default: false */
  morphCleanup: boolean
  /** Apply jaggy cleanup to smooth edges. Default: true */
  jaggyCleanup: boolean
  /** Snap output to detected pixel grid. Default: true */
  snapGrid: boolean
  /** Alpha channel threshold for binarization (0-255). Default: 128 */
  alphaThreshold: number
}

/** Default unfake processing settings */
export const DEFAULT_UNFAKE_SETTINGS: UnfakeSettings = {
  maxColors: 32,
  autoColorCount: false,
  downscaleMethod: 'dominant',
  detectMethod: 'auto',
  edgeDetectMethod: 'tiled',
  domMeanThreshold: 0.15,
  manualScale: null,
  morphCleanup: false,
  jaggyCleanup: true,
  snapGrid: true,
  alphaThreshold: 128,
}

/** Convert UnfakeSettings to processImage parameters */
export function toProcessImageParams(settings: UnfakeSettings) {
  return {
    maxColors: settings.maxColors,
    autoColorCount: settings.autoColorCount,
    downscaleMethod: settings.downscaleMethod,
    detectMethod: settings.detectMethod,
    edgeDetectMethod: settings.edgeDetectMethod,
    domMeanThreshold: settings.domMeanThreshold,
    manualScale: settings.manualScale,
    cleanup: {
      morph: settings.morphCleanup,
      jaggy: settings.jaggyCleanup,
    },
    snapGrid: settings.snapGrid,
    alphaThreshold: settings.alphaThreshold,
  }
}

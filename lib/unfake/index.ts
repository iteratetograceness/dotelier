// https://github.com/jenissimo/unfake.js

import { processImage } from './pixel'
import {
  DEFAULT_UNFAKE_SETTINGS,
  toProcessImageParams,
  type UnfakeSettings,
} from './types'
import {
  countColors,
  cvReady,
  detectScale,
  dominantOrMean,
  downscaleBlock,
  encodePng,
  fileToImageData,
  finalizePixels,
  findOptimalCrop,
  getPaletteFromImage,
  mean,
  median,
  mode,
  morphologicalCleanup,
} from './utils'
import { vectorizeImage } from './vector'

// Re-export all functions
export {
  countColors,
  cvReady,
  DEFAULT_UNFAKE_SETTINGS,
  detectScale,
  dominantOrMean,
  downscaleBlock,
  encodePng,
  fileToImageData,
  finalizePixels,
  findOptimalCrop,
  getPaletteFromImage,
  mean,
  median,
  mode,
  morphologicalCleanup,
  processImage,
  toProcessImageParams,
  vectorizeImage,
}

// Re-export types
export type { UnfakeSettings }

// Default export with all functions
export default {
  processImage,
  vectorizeImage,
  utils: {
    cvReady,
    fileToImageData,
    morphologicalCleanup,
    countColors,
    detectScale,
    findOptimalCrop,
    median,
    mode,
    mean,
    dominantOrMean,
    finalizePixels,
    encodePng,
    getPaletteFromImage,
    downscaleBlock,
  },
}

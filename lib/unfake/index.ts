// https://github.com/jenissimo/unfake.js

import { processImage } from './pixel'
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

// Re-export worker manager (for Web Worker-based processing)
export { unfakeWorker, UnfakeWorkerManager } from './worker-manager'
export type { ProcessResult } from './worker-manager'
export type { ProcessImageOptions } from './worker'

// Re-export all functions
export {
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
  processImage,
  vectorizeImage,
}

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

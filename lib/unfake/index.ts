// https://github.com/jenissimo/unfake.js

import { processImage } from './pixel.js'
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
} from './utils.js'
import { vectorizeImage } from './vector.js'

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

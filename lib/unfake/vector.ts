// vector.js – Vector processing module
// Handles image vectorization using imagetracer.js

import ImageTracer, { type TracerOptions } from 'imagetracerjs'
import {
  detectOptimalColorCount,
  fileToImageData,
  quantizeImage,
  withCv,
} from './utils'

/**
 * Applies pre-processing filters to an ImageData object to reduce noise from AI generation.
 */
export async function preProcessImage(
  imgData: ImageData,
  options: {
    filter: string
    value: number
    morphology: boolean
    morphologyKernel: number
  }
): Promise<ImageData> {
  // Using withCv to handle OpenCV resource management automatically
  return withCv(async (cv, track) => {
    const src = track(cv.matFromImageData(imgData))
    const dst = track(new cv.Mat())

    if (options.filter === 'bilateral') {
      const d = options.value || 15
      const sigmaColor = d * 2
      const sigmaSpace = d / 2

      // Bilateral filter can corrupt alpha, so we process RGB channels separately
      const channels = track(new cv.MatVector())
      cv.split(src, channels)

      const rgb = track(new cv.Mat())
      const rgbChannels = track(new cv.MatVector())
      rgbChannels.push_back(channels.get(0))
      rgbChannels.push_back(channels.get(1))
      rgbChannels.push_back(channels.get(2))
      cv.merge(rgbChannels, rgb)

      const filteredRgb = track(new cv.Mat())
      cv.bilateralFilter(
        rgb,
        filteredRgb,
        d,
        sigmaColor,
        sigmaSpace,
        cv.BORDER_DEFAULT
      )

      // Re-add original alpha channel
      const filteredChannels = track(new cv.MatVector())
      cv.split(filteredRgb, filteredChannels)

      const finalChannels = track(new cv.MatVector())
      finalChannels.push_back(filteredChannels.get(0))
      finalChannels.push_back(filteredChannels.get(1))
      finalChannels.push_back(filteredChannels.get(2))
      finalChannels.push_back(channels.get(3)) // Original alpha
      cv.merge(finalChannels, dst)
    } else if (options.filter === 'median') {
      let ksize = options.value || 5
      if (ksize % 2 === 0) ksize++ // Must be odd
      cv.medianBlur(src, dst, ksize)
    } else {
      return imgData
    }

    if (options.morphology) {
      const kernelSize = options.morphologyKernel || 3
      const kernel = track(cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U))
      cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel)
    }

    return new ImageData(new Uint8ClampedArray(dst.data), dst.cols, dst.rows)
  })
}

/**
 * Fills the transparent background of an ImageData object with a solid color.
 * This is used to prevent edge artifacts during blurring when processing images with alpha.
 */
async function fillBackground(
  imgData: ImageData,
  color = { r: 255, g: 0, b: 255, a: 255 }
): Promise<ImageData> {
  return withCv(async (cv, track) => {
    const src = track(cv.matFromImageData(imgData))
    const { width, height } = imgData

    // Create a Mat with the specified background color
    const bgMat = track(
      new cv.Mat(height, width, cv.CV_8UC4, [
        color.r,
        color.g,
        color.b,
        color.a,
      ])
    )

    // Create a mask from the source image's alpha channel using split()
    const channels = track(new cv.MatVector())
    cv.split(src, channels)
    const alphaMask = track(channels.get(3)) // Channel 3 is Alpha

    // Copy the source image onto the background, using its own alpha as a mask
    src.copyTo(bgMat, alphaMask)

    return new ImageData(new Uint8ClampedArray(bgMat.data), width, height)
  })
}

/**
 * Removes the path corresponding to a specific background color from an SVG string.
 */
function removeSvgBackground(
  svgString: string,
  color: { r: number; g: number; b: number }
): string {
  if (!svgString || !color) return svgString

  // This regex is designed to find a <path> tag containing the specific fill attribute
  // and remove it. It accounts for potential whitespace in the rgb() color definition.
  const rgbFill = `rgb\\(\\s*${color.r}\\s*,\\s*${color.g}\\s*,\\s*${color.b}\\s*\\)`
  const regex = new RegExp(`<path[^>]*?fill="${rgbFill}"[^>]*?\\/>`, 'g')

  const cleanedSvg = svgString.replace(regex, '')

  if (cleanedSvg.length < svgString.length) {
    console.log(`Successfully removed background path with color ${rgbFill}`)
  } else {
    console.warn(
      `Could not find background path with color ${rgbFill} to remove.`
    )
  }

  return cleanedSvg
}

/**
 * Extracts all unique colors from the fill attributes of paths in an SVG string.
 */
function extractPaletteFromSvg(
  svgString: string
): { r: number; g: number; b: number; a: number }[] {
  if (!svgString) return []

  const colorSet: Set<string> = new Set()
  // Regex to find all fill="rgb(r, g, b)" attributes in the SVG
  const regex = /fill="rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)"/g
  let match

  while ((match = regex.exec(svgString)) !== null) {
    // Create a consistent string representation to ensure uniqueness
    const colorString = `${match[1]},${match[2]},${match[3]}`
    colorSet.add(colorString)
  }

  // Convert the unique color strings back to color objects
  const palette = Array.from(colorSet).map((rgbStr) => {
    const [r, g, b] = rgbStr.split(',').map(Number)
    return { r, g, b, a: 255 } // Use a standard palette object format
  })

  return palette
}

/**
 * Checks if an ImageData object contains any non-opaque pixels.
 */
function hasTransparency(imgData: ImageData): boolean {
  const d = imgData.data
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] < 255) return true
  }
  return false
}

/**
 * Applies post-quantization smoothing to soften jagged edges.
 */
export async function postProcessImage(
  imgData: ImageData,
  options: {
    filter: string
    value: number
  }
): Promise<ImageData> {
  return withCv(async (cv, track) => {
    const src = track(cv.matFromImageData(imgData))
    const dst = track(new cv.Mat())
    let ksize = options.value || 3
    if (ksize % 2 === 0) ksize++ // Kernel size must be odd

    if (options.filter === 'gaussian') {
      const kernel = new cv.Size(ksize, ksize)
      cv.GaussianBlur(src, dst, kernel, 0, 0, cv.BORDER_DEFAULT)
    } else if (options.filter === 'median') {
      cv.medianBlur(src, dst, ksize)
    } else {
      return imgData
    }
    return new ImageData(new Uint8ClampedArray(dst.data), dst.cols, dst.rows)
  })
}

export async function vectorizeImage({
  file,
  preProcess,
  quantize,
  postProcess,
  traceOptions = {},
}: {
  file: File
  preProcess: {
    enabled: boolean
    filter: string
    value: number
    morphology: boolean
    morphologyKernel: number
  }
  quantize: {
    enabled: boolean
    maxColors: number | 'auto'
  }
  postProcess: {
    enabled: boolean
    filter: string
    value: number
  }
  traceOptions?: TracerOptions
}): Promise<{
  svg: string
  manifest: object
  palette?: { r: number; g: number; b: number; a: number }[]
}> {
  const t0 = performance.now()
  const magicBackgroundColor = { r: 255, g: 0, b: 255, a: 255 }
  let backgroundWasAdded = false

  // 1. Get ImageData from file
  let imgData = await fileToImageData(file)

  // NEW: If image has transparency, apply a temporary solid background *before* any processing.
  // This prevents all kinds of artifacts on the edges during filtering and quantization.
  if (hasTransparency(imgData)) {
    imgData = await fillBackground(imgData, magicBackgroundColor)
    backgroundWasAdded = true
  }

  // 2. Pre-process to remove noise before tracing
  if (preProcess?.enabled) {
    try {
      const preProcessDefaults = {
        filter: 'bilateral', // 'bilateral' or 'median'
        value: 15, // d for bilateral, ksize for median
        morphology: true,
        morphologyKernel: 3,
      }
      const finalPreProcessOptions = { ...preProcessDefaults, ...preProcess }
      imgData = await preProcessImage(imgData, finalPreProcessOptions)
    } catch (error) {
      console.error(
        'Pre-processing failed, continuing with original image.',
        error
      )
    }
  }

  // 3. Quantize colors to create a clean palette before tracing
  if (quantize?.enabled) {
    try {
      let numColors = quantize.maxColors || 16

      if (numColors === 'auto') {
        numColors = await detectOptimalColorCount(imgData)
      }

      const { quantized, palette } = quantizeImage(imgData, numColors)
      imgData = quantized

      // Pass the exact palette to ImageTracer to prevent it from guessing.
      // This also disables its internal color quantization.
      if (palette?.length) {
        traceOptions.pal = palette
        traceOptions.colorsampling = 0 // Disable color sampling
        traceOptions.numberofcolors = palette.length
      }
    } catch (error) {
      console.error(
        'Quantization failed, continuing with previous image version.',
        error
      )
    }
  }

  // 4. Post-process to smooth jagged edges from quantization before tracing
  if (postProcess?.enabled) {
    try {
      const postProcessDefaults = {
        filter: 'gaussian',
        value: 3, // Kernel size
      }
      const finalPostProcessOptions = { ...postProcessDefaults, ...postProcess }
      imgData = await postProcessImage(imgData, finalPostProcessOptions)
    } catch (error) {
      console.error(
        'Post-processing smoothing failed, continuing with quantized image.',
        error
      )
    }
  }

  // 5. Set ImageTracer options
  // First defaults, then override with user settings
  const options: TracerOptions = {
    // Tracing
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    rightangleenhance: true,

    // Color quantization
    colorsampling: 2, // 2 = deterministic sampling
    numberofcolors: 16,
    mincolorratio: 0,
    colorquantcycles: 3,

    // SVG rendering
    strokewidth: 1,
    linefilter: false,
    scale: 1,
    roundcoords: 1,
    viewbox: true, // Enable viewBox for scalability
    desc: false,

    // Blur
    blurradius: 0,
    blurdelta: 20,

    // Override default values with user settings
    ...traceOptions,
  }

  // 6. Vectorize
  let svgString = ImageTracer.imagedataToSVG(imgData, options)

  // 7. Remove the magic background color from the final SVG if it was added
  if (backgroundWasAdded) {
    svgString = removeSvgBackground(svgString, magicBackgroundColor)
  }

  // 8. Extract the actual palette from the final SVG for maximum accuracy
  const finalPalette = extractPaletteFromSvg(svgString)

  const t1 = performance.now()
  const manifest = {
    original_size: [imgData.width, imgData.height],
    processing_time_ms: Math.round(t1 - t0),
    timestamp: new Date().toISOString(),
    options: options, // save used options
    preProcess, // and pre-processing options
    quantize, // and quantization options
    postProcess, // and post-processing options
  }

  return { svg: svgString, manifest, palette: finalPalette }
}

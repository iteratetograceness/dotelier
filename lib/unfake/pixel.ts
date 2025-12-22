import type { CV, Mat } from '@techstark/opencv-js'
import { SVD } from 'svd-js'
import {
  alphaBinarization,
  countColors,
  detectOptimalColorCount,
  detectScale,
  downscaleBlock,
  encodePng,
  fileToImageData,
  finalizePixels,
  findOptimalCrop,
  gcdArray,
  getPaletteFromImage,
  jaggyCleaner,
  median,
  mode,
  morphologicalCleanup,
  multiply2x2,
  quantizeImage,
  TrackFn,
  withCv,
} from './utils'

/**
 * Detects pixel art scale by analyzing color run lengths. This method is very reliable for "clean" pixel art with uniform block sizes.
 */
export function runsBasedDetect(imgData: ImageData): number {
  const { data, width, height } = imgData
  const allRunLens: number[] = []
  const scanRuns = (isHorizontal: boolean) => {
    const primaryDim = isHorizontal ? height : width
    const secondaryDim = isHorizontal ? width : height
    for (let i = 0; i < primaryDim; i++) {
      let currentRunLength = 1
      for (let j = 1; j < secondaryDim; j++) {
        const idx1 = isHorizontal ? (i * width + j) * 4 : (j * width + i) * 4
        const idx2 = isHorizontal ? idx1 - 4 : ((j - 1) * width + i) * 4
        const isSamePixel =
          data[idx1] === data[idx2] &&
          data[idx1 + 1] === data[idx2 + 1] &&
          data[idx1 + 2] === data[idx2 + 2] &&
          data[idx1 + 3] === data[idx2 + 3]
        if (isSamePixel) {
          currentRunLength++
        } else {
          if (currentRunLength > 1) allRunLens.push(currentRunLength)
          currentRunLength = 1
        }
      }
      if (currentRunLength > 1) allRunLens.push(currentRunLength)
    }
  }
  scanRuns(true)
  scanRuns(false)
  if (allRunLens.length < 10) {
    return 1
  }
  const detectedScale = gcdArray(allRunLens)
  return Math.max(1, detectedScale)
}

/**
 * Legacy edge-aware detection that uses a single, large ROI.
 * Fast but can be less accurate on complex images.
 */
export async function legacyEdgeAwareDetect(
  imgData: ImageData
): Promise<number> {
  return withCv(async (cv, track) => {
    const srcMat = track(cv.matFromImageData(imgData))
    const gray = track(new cv.Mat())
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY)
    return await singleRegionEdgeDetect(gray, cv, track)
  })
}

/**
 * Detects pixel art scale using a robust, tiled edge-aware algorithm.
 * This is the default and recommended edge detection method.
 */
export async function edgeAwareDetect(imgData: ImageData): Promise<number> {
  if (imgData.width * imgData.height > 8_000_000) {
    return runsBasedDetect(imgData)
  }

  return withCv(async (cv, track) => {
    try {
      const srcMat = track(cv.matFromImageData(imgData))
      const gray = track(new cv.Mat())
      cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY)

      const allScales = []
      const TILE_COUNT = 3 // 3x3 grid
      const OVERLAP = 0.25 // 25% overlap

      const tileW = Math.floor(gray.cols / TILE_COUNT)
      const tileH = Math.floor(gray.rows / TILE_COUNT)
      const overlapW = Math.floor(tileW * OVERLAP)
      const overlapH = Math.floor(tileH * OVERLAP)

      if (tileW < 50 || tileH < 50) {
        // Fallback to original logic for small images
        return await singleRegionEdgeDetect(gray, cv, track)
      }

      for (let y = 0; y < TILE_COUNT; y++) {
        for (let x = 0; x < TILE_COUNT; x++) {
          const roiX = Math.max(0, x * tileW - overlapW)
          const roiY = Math.max(0, y * tileH - overlapH)
          const roiW = Math.min(gray.cols - roiX, tileW + 2 * overlapW)
          const roiH = Math.min(gray.rows - roiY, tileH + 2 * overlapH)

          if (roiW < 30 || roiH < 30) continue

          const roiRect = new cv.Rect(roiX, roiY, roiW, roiH)
          const tileMat = track(gray.roi(roiRect))

          // Simple check for content variance to skip blank tiles
          const mean = track(new cv.Mat())
          const stddev = track(new cv.Mat())
          cv.meanStdDev(tileMat, mean, stddev)
          if (stddev.data64F[0] < 5.0) {
            continue
          }

          const hSum = getProfile(tileMat, 'horizontal', cv, track)
          const vSum = getProfile(tileMat, 'vertical', cv, track)

          const hScale = detectScale(Array.from(hSum))
          const vScale = detectScale(Array.from(vSum))

          if (hScale > 1) allScales.push(hScale)
          if (vScale > 1) allScales.push(vScale)
        }
      }

      if (allScales.length === 0) {
        return await singleRegionEdgeDetect(gray, cv, track)
      }

      const bestScale = mode(allScales) || 1
      return bestScale
    } catch (error) {
      return 1
    }
  })
}

/**
 * Helper to perform edge detection on a single region of a grayscale cv.Mat.
 */
async function singleRegionEdgeDetect(
  grayMat: Mat,
  cv: CV,
  track: TrackFn
): Promise<number> {
  const w = grayMat.cols,
    h = grayMat.rows
  // Use center 75% as ROI
  const roiRect = new cv.Rect(
    Math.floor(w * 0.125),
    Math.floor(h * 0.125),
    Math.floor(w * 0.75),
    Math.floor(h * 0.75)
  )

  if (roiRect.width < 3 || roiRect.height < 3) {
    return 1
  }
  const roiMat = track(grayMat.roi(roiRect))
  const hSum = getProfile(roiMat, 'horizontal', cv, track)
  const vSum = getProfile(roiMat, 'vertical', cv, track)

  const hScale = detectScale(Array.from(hSum))
  const vScale = detectScale(Array.from(vSum))

  // Simple average if scales differ, favoring larger scales if close
  if (hScale > 1 && vScale > 1 && Math.abs(hScale - vScale) <= 2) {
    return Math.round((hScale + vScale) / 2)
  }
  // Return the more confident (larger) scale, or 1 if none found
  const result = Math.max(hScale, vScale, 1)
  return result
}

/**
 * Generates a gradient profile for a given matrix.
 */
function getProfile(
  mat: Mat,
  direction: 'horizontal' | 'vertical',
  cv: CV,
  track: TrackFn
): Float32Array {
  const diff = track(new cv.Mat())
  if (direction === 'horizontal') {
    cv.Sobel(mat, diff, cv.CV_32F, 1, 0)
  } else {
    cv.Sobel(mat, diff, cv.CV_32F, 0, 1)
  }

  const axis = direction === 'horizontal' ? 0 : 1
  const sums = new Float32Array(axis === 0 ? mat.cols : mat.rows).fill(0)
  const data = diff.data32F
  for (let y = 0; y < mat.rows; y++) {
    for (let x = 0; x < mat.cols; x++) {
      const val = Math.abs(data[y * mat.cols + x])
      if (axis === 0) sums[x] += val
      else sums[y] += val
    }
  }
  return sums
}

/**
 * Enhanced downscaling method using dominant color.
 * Prevents artifact colors by working with full colors (RGB)
 * rather than individual channels. Works with already quantized colors,
 * which guarantees using only colors from the original palette.
 */
export function downscaleByDominantColor(
  imgData: ImageData,
  scale: number,
  threshold = 0.15
): ImageData {
  const targetW = Math.floor(imgData.width / scale)
  const targetH = Math.floor(imgData.height / scale)
  const outData = new Uint8ClampedArray(targetW * targetH * 4)
  const srcData = imgData.data
  const srcWidth = imgData.width

  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const colorCounts = new Map()
      const alphaValues = []
      const opaqueColorsForMean = []

      // Scan scale x scale block once
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const sx = tx * scale + dx
          const sy = ty * scale + dy
          if (sx >= srcWidth || sy >= imgData.height) continue
          const idx = (sy * srcWidth + sx) * 4

          const a = srcData[idx + 3]
          alphaValues.push(a)

          // Only consider opaque pixels for color determination
          if (a > 128) {
            const r = srcData[idx]
            const g = srcData[idx + 1]
            const b = srcData[idx + 2]
            const colorInt = (r << 16) | (g << 8) | b
            colorCounts.set(colorInt, (colorCounts.get(colorInt) || 0) + 1)
            opaqueColorsForMean.push(colorInt)
          }
        }
      }

      const outIdx = (ty * targetW + tx) * 4

      if (opaqueColorsForMean.length > 0) {
        let dominantColor = 0
        let maxCount = 0

        // Find the dominant color from our counts
        for (const [color, count] of colorCounts.entries()) {
          if (count > maxCount) {
            maxCount = count
            dominantColor = color
          }
        }

        let finalColor
        // Use dominant color only if its frequency is above the threshold
        if (maxCount / opaqueColorsForMean.length >= threshold) {
          finalColor = dominantColor
        } else {
          // Otherwise, fall back to the mean color of the block
          const rSum = opaqueColorsForMean.reduce(
            (sum, color) => sum + ((color >> 16) & 0xff),
            0
          )
          const gSum = opaqueColorsForMean.reduce(
            (sum, color) => sum + ((color >> 8) & 0xff),
            0
          )
          const bSum = opaqueColorsForMean.reduce(
            (sum, color) => sum + (color & 0xff),
            0
          )
          const avgR = Math.round(rSum / opaqueColorsForMean.length)
          const avgG = Math.round(gSum / opaqueColorsForMean.length)
          const avgB = Math.round(bSum / opaqueColorsForMean.length)
          finalColor = (avgR << 16) | (avgG << 8) | avgB
        }

        // Write result
        outData[outIdx] = (finalColor >> 16) & 0xff // R
        outData[outIdx + 1] = (finalColor >> 8) & 0xff // G
        outData[outIdx + 2] = finalColor & 0xff // B
        outData[outIdx + 3] = median(alphaValues) > 128 ? 255 : 0 // Binary alpha
      } else {
        // If block is completely transparent, make pixel black and transparent
        outData[outIdx] = 0
        outData[outIdx + 1] = 0
        outData[outIdx + 2] = 0
        outData[outIdx + 3] = 0
      }
    }
  }

  return new ImageData(outData, targetW, targetH)
}

/**
 * The core content-adaptive downscaling algorithm.
 * This function processes an OpenCV Mat in Lab color space.
 *
 * Modified for pixel art: Uses dominant color selection instead of weighted
 * averaging to preserve discrete color palettes.
 */
function _contentAdaptiveCore(
  srcLab: Mat,
  targetW: number,
  targetH: number,
  cv: CV,
  track: TrackFn
): Mat {
  const NUM_ITERATIONS = 3 // Reduced iterations - we only need position refinement

  const { cols: wi, rows: hi } = srcLab
  const wo = targetW,
    ho = targetH
  const rx = wi / wo,
    ry = hi / ho

  const r_avg = (rx + ry) / 2.0
  const min_singular_value = 0.5
  const max_singular_value = Math.max(1.0, 0.5 * r_avg)

  const labPlanes = track(new cv.MatVector())
  cv.split(srcLab, labPlanes)
  const L_plane = track(labPlanes.get(0))
  const a_plane = track(labPlanes.get(1))
  const b_plane = track(labPlanes.get(2))

  // Pre-extract all Lab values for faster access
  const labValues: Array<[number, number, number]> = new Array(wi * hi)
  for (let i = 0; i < wi * hi; i++) {
    labValues[i] = [L_plane.data32F[i], a_plane.data32F[i], b_plane.data32F[i]]
  }

  // Typed arrays for better performance
  const numKernels = wo * ho
  const mu_k: Array<[number, number]> = new Array(numKernels)
  const Sigma_k: Array<[number, number, number, number]> = new Array(numKernels)
  const nu_k: Array<[number, number, number]> = new Array(numKernels)

  // Initialization
  for (let yk = 0; yk < ho; yk++) {
    for (let xk = 0; xk < wo; xk++) {
      const k_idx = yk * wo + xk
      mu_k[k_idx] = [(xk + 0.5) * rx, (yk + 0.5) * ry]
      const initial_sx = (rx / 3) * (rx / 3)
      const initial_sy = (ry / 3) * (ry / 3)
      Sigma_k[k_idx] = [initial_sx, 0, 0, initial_sy]
      nu_k[k_idx] = [50.0, 0.0, 0.0]
    }
  }

  // EM-C Iterations (for position refinement only)
  for (let iter = 0; iter < NUM_ITERATIONS; iter++) {
    // E-Step
    const gamma_sum_per_pixel = new Float32Array(wi * hi).fill(1e-9)
    const w_ki: Array<Map<number, number>> = new Array(numKernels)
    for (let k = 0; k < numKernels; k++) {
      w_ki[k] = new Map()
    }

    for (let k = 0; k < numKernels; k++) {
      const [s0, s1, s2, s3] = Sigma_k[k]
      const det = s0 * s3 - s1 * s2
      const inv_det = 1.0 / (det + 1e-9)
      const sigma_inv: [number, number, number, number] = [
        s3 * inv_det,
        -s1 * inv_det,
        -s2 * inv_det,
        s0 * inv_det,
      ]

      const [mu_x, mu_y] = mu_k[k]
      const i_min_x = Math.max(0, Math.floor(mu_x - 2 * rx))
      const i_max_x = Math.min(wi, Math.ceil(mu_x + 2 * rx))
      const i_min_y = Math.max(0, Math.floor(mu_y - 2 * ry))
      const i_max_y = Math.min(hi, Math.ceil(mu_y + 2 * ry))

      let w_sum = 1e-9
      for (let yi = i_min_y; yi < i_max_y; yi++) {
        for (let xi = i_min_x; xi < i_max_x; xi++) {
          const dx = xi - mu_x
          const dy = yi - mu_y
          const exponent =
            dx * dx * sigma_inv[0] +
            2 * dx * dy * sigma_inv[1] +
            dy * dy * sigma_inv[3]
          const weight = Math.exp(-0.5 * exponent)
          if (weight > 1e-5) {
            const i = yi * wi + xi
            w_ki[k].set(i, weight)
            w_sum += weight
          }
        }
      }
      for (const [i, weight] of w_ki[k].entries()) {
        const normalized_w = weight / w_sum
        w_ki[k].set(i, normalized_w)
        gamma_sum_per_pixel[i] += normalized_w
      }
    }

    // M-Step with dominant color selection for pixel art
    const next_mu_k: Array<[number, number]> = new Array(numKernels)
    const next_Sigma_k: Array<[number, number, number, number]> = new Array(numKernels)
    const next_nu_k: Array<[number, number, number]> = new Array(numKernels)

    for (let k = 0; k < numKernels; k++) {
      let w_sum = 1e-9
      let new_mu: [number, number] = [0, 0]

      // Collect weighted colors for this kernel
      const colorWeights = new Map<string, { weight: number; lab: [number, number, number] }>()

      for (const [i, wk] of w_ki[k].entries()) {
        const gamma_k_i = wk / gamma_sum_per_pixel[i]
        w_sum += gamma_k_i
        const yi = Math.floor(i / wi)
        const xi = i % wi
        new_mu[0] += gamma_k_i * xi
        new_mu[1] += gamma_k_i * yi

        // Quantize Lab values to find distinct colors (bin by ~5 units in each channel)
        const lab = labValues[i]
        const binL = Math.round(lab[0] / 5) * 5
        const binA = Math.round(lab[1] / 5) * 5
        const binB = Math.round(lab[2] / 5) * 5
        const colorKey = `${binL},${binA},${binB}`

        const existing = colorWeights.get(colorKey)
        if (existing) {
          existing.weight += gamma_k_i
        } else {
          colorWeights.set(colorKey, { weight: gamma_k_i, lab: [...lab] })
        }
      }

      new_mu[0] /= w_sum
      new_mu[1] /= w_sum
      next_mu_k[k] = new_mu

      // Select dominant color instead of averaging
      let dominantColor: [number, number, number] = [50, 0, 0]
      let maxWeight = 0
      for (const { weight, lab } of colorWeights.values()) {
        if (weight > maxWeight) {
          maxWeight = weight
          dominantColor = lab
        }
      }
      next_nu_k[k] = dominantColor

      // Compute covariance for position (unchanged)
      let new_Sigma_arr: [number, number, number, number] = [0, 0, 0, 0]
      for (const [i, wk] of w_ki[k].entries()) {
        const gamma_k_i = wk / gamma_sum_per_pixel[i]
        const yi = Math.floor(i / wi)
        const xi = i % wi
        const dx = xi - new_mu[0]
        const dy = yi - new_mu[1]
        new_Sigma_arr[0] += gamma_k_i * dx * dx
        new_Sigma_arr[1] += gamma_k_i * dx * dy
        new_Sigma_arr[3] += gamma_k_i * dy * dy
      }
      new_Sigma_arr[0] /= w_sum
      new_Sigma_arr[1] /= w_sum
      new_Sigma_arr[2] = new_Sigma_arr[1]
      new_Sigma_arr[3] /= w_sum
      next_Sigma_k[k] = new_Sigma_arr
    }

    // C-Step (Clamping)
    for (let k = 0; k < numKernels; k++) {
      const sigma_arr = next_Sigma_k[k]
      const sigma_mat2d = [
        [sigma_arr[0], sigma_arr[1]],
        [sigma_arr[2], sigma_arr[3]],
      ]

      const { u, q, v } = SVD(sigma_mat2d)

      q[0] = Math.max(min_singular_value, Math.min(q[0], max_singular_value))
      q[1] = Math.max(min_singular_value, Math.min(q[1], max_singular_value))

      const s_diag = [
        [q[0], 0],
        [0, q[1]],
      ]
      const v_t = [
        [v[0][0], v[1][0]],
        [v[0][1], v[1][1]],
      ]

      const temp = multiply2x2(u, s_diag)
      const new_sigma_mat2d = multiply2x2(temp, v_t)

      const final_sigma: [number, number, number, number] = [
        new_sigma_mat2d[0][0],
        new_sigma_mat2d[0][1],
        new_sigma_mat2d[1][0],
        new_sigma_mat2d[1][1],
      ]

      mu_k[k] = next_mu_k[k]
      Sigma_k[k] = final_sigma
      nu_k[k] = next_nu_k[k]
    }
  }

  // Final image construction from kernels
  const outLab = track(new cv.Mat(ho, wo, cv.CV_32FC3))
  for (let yk = 0; yk < ho; yk++) {
    for (let xk = 0; xk < wo; xk++) {
      const k_idx = yk * wo + xk
      const [l, a, b] = nu_k[k_idx]
      outLab.data32F[(yk * wo + xk) * 3] = l
      outLab.data32F[(yk * wo + xk) * 3 + 1] = a
      outLab.data32F[(yk * wo + xk) * 3 + 2] = b
    }
  }

  return outLab
}

/**
 * EXPERIMENTAL: Content-adaptive downscaling.
 *
 * High-quality but computationally expensive. Separates Alpha channel for proper handling.
 *
 * Based on https://johanneskopf.de/publications/downscaling/
 */
export async function contentAdaptiveDownscale(
  imgData: ImageData,
  targetW: number,
  targetH: number
): Promise<ImageData> {
  if (typeof SVD !== 'function') {
    throw new Error(
      'SVD.js library is required for content-adaptive downscaling.'
    )
  }

  return withCv(async (cv, track) => {
    const srcMat = track(cv.matFromImageData(imgData))
    const channels = track(new cv.MatVector())
    cv.split(srcMat, channels)

    // 1. Downscale Alpha channel separately using area interpolation (best for shrinking).
    const alpha = track(channels.get(3))
    const outAlpha = track(new cv.Mat())
    cv.resize(
      alpha,
      outAlpha,
      new cv.Size(targetW, targetH),
      0,
      0,
      cv.INTER_AREA
    )

    // 2. Process RGB channels with the content-adaptive algorithm.
    const srcRGB = track(new cv.Mat())
    const rgbVec = track(new cv.MatVector())
    rgbVec.push_back(channels.get(0))
    rgbVec.push_back(channels.get(1))
    rgbVec.push_back(channels.get(2))
    cv.merge(rgbVec, srcRGB)

    const srcRGB32f = track(new cv.Mat())
    srcRGB.convertTo(srcRGB32f, cv.CV_32F, 1.0 / 255.0)
    const srcLab = track(new cv.Mat())
    cv.cvtColor(srcRGB32f, srcLab, cv.COLOR_RGB2Lab)

    const outLab = _contentAdaptiveCore(srcLab, targetW, targetH, cv, track)

    const outRGB_32f = track(new cv.Mat())
    cv.cvtColor(outLab, outRGB_32f, cv.COLOR_Lab2RGB)
    const outRGB_8u = track(new cv.Mat())
    outRGB_32f.convertTo(outRGB_8u, cv.CV_8U, 255.0, 0)

    // 3. Merge downscaled RGB with downscaled Alpha.
    const outRgbSplit = track(new cv.MatVector())
    cv.split(outRGB_8u, outRgbSplit)
    const finalRgbaMat = track(new cv.Mat())
    const rgbaVec = track(new cv.MatVector())
    rgbaVec.push_back(outRgbSplit.get(0))
    rgbaVec.push_back(outRgbSplit.get(1))
    rgbaVec.push_back(outRgbSplit.get(2))
    rgbaVec.push_back(outAlpha)
    cv.merge(rgbaVec, finalRgbaMat)

    return new ImageData(
      new Uint8ClampedArray(finalRgbaMat.data),
      targetW,
      targetH
    )
  })
}

/** Main image processing pipeline. */
export async function processImage({
  file,
  maxColors = 32,
  autoColorCount = false,
  manualScale = null,
  detectMethod = 'auto', // 'auto', 'runs', 'edge'
  edgeDetectMethod = 'tiled', // 'tiled' or 'legacy'
  downscaleMethod = 'dominant', // 'dominant', 'median', 'mode', 'mean', 'nearest', 'content-adaptive'
  domMeanThreshold = 0.15, // CHANGED: Increased from 0.05 for more robust dominant color selection.
  cleanup = { morph: false, jaggy: false },
  fixedPalette = null,
  alphaThreshold = 128,
  snapGrid = true,
  maxGridSize = 32, // Maximum grid dimension (width or height) - prevents huge grids from bad AI generations
}: {
  file: File | Blob
  maxColors?: number
  autoColorCount?: boolean
  manualScale?: number | [number, number] | null
  detectMethod?: 'auto' | 'runs' | 'edge'
  edgeDetectMethod?: 'tiled' | 'legacy'
  downscaleMethod?:
    | 'dominant'
    | 'median'
    | 'mode'
    | 'mean'
    | 'nearest'
    | 'content-adaptive'
  domMeanThreshold?: number
  cleanup?: { morph: boolean; jaggy: boolean }
  fixedPalette?: string[] | null
  alphaThreshold?: number
  snapGrid?: boolean
  maxGridSize?: number
}): Promise<{
  png: Uint8Array
  imageData: ImageData
  palette: string[]
  manifest: {
    original_size: [number, number]
    final_size: [number, number]
  }
}> {
  if (!file) throw new Error('No file provided.')

  const t0 = performance.now()
  const imgData = await fileToImageData(file)

  if (!imgData) throw new Error('No image data return from fileToImageData')

  let current = imgData

  const originalSize: [number, number] = [current.width, current.height]

  if (
    current.width > 8000 ||
    current.height > 8000 ||
    current.width * current.height > 10_000_000
  ) {
    throw new Error(`Image too large: ${current.width}x${current.height}.`)
  }

  // 1. Pre-processing: Binarize alpha
  if (alphaThreshold !== null) {
    current = alphaBinarization(current, alphaThreshold)
  }
  const originalForAdaptiveScale = current

  // 2. Scale Detection
  let scale = 1
  if (manualScale) {
    scale = Math.max(
      1,
      Array.isArray(manualScale) ? manualScale[0] : manualScale
    )
  } else {
    const detectionFn = {
      runs: runsBasedDetect,
      edge:
        edgeDetectMethod === 'legacy' ? legacyEdgeAwareDetect : edgeAwareDetect,
      auto: async (img: ImageData): Promise<number> => {
        const runsScale = runsBasedDetect(img)
        if (runsScale > 1) {
          return runsScale
        }
        const edgeFn =
          edgeDetectMethod === 'legacy'
            ? legacyEdgeAwareDetect
            : edgeAwareDetect
        return await edgeFn(img)
      },
    }[detectMethod]

    scale = await detectionFn(originalForAdaptiveScale)
  }

  // Enforce max grid size - calculate minimum scale needed to fit within maxGridSize
  if (maxGridSize && maxGridSize > 0) {
    const projectedWidth = Math.floor(current.width / scale)
    const projectedHeight = Math.floor(current.height / scale)
    const maxDimension = Math.max(projectedWidth, projectedHeight)

    if (maxDimension > maxGridSize) {
      const minScaleForWidth = Math.ceil(current.width / maxGridSize)
      const minScaleForHeight = Math.ceil(current.height / maxGridSize)
      const minScale = Math.max(minScaleForWidth, minScaleForHeight)
      console.log(
        `[processImage] Projected size ${projectedWidth}x${projectedHeight} exceeds maxGridSize ${maxGridSize}. ` +
        `Increasing scale from ${scale} to ${minScale}.`
      )
      scale = minScale
    }
  }

  if (scale <= 1 && downscaleMethod !== 'content-adaptive') {
    console.log('Scale is 1, skipping downscale and grid snapping.')
  }

  // 2.5. NEW Snap to Grid
  if (snapGrid && scale > 1) {
    await withCv(async (cv, track) => {
      const srcMat = track(cv.matFromImageData(current))
      const grayMat = track(new cv.Mat())
      cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY)

      // Find optimal offset
      const crop = findOptimalCrop(grayMat, scale, cv)

      // CHANGED: Calculate new size divisible by scale for pixel-perfect result.
      const newWidth = Math.floor((current.width - crop.x) / scale) * scale
      const newHeight = Math.floor((current.height - crop.y) / scale) * scale

      if (newWidth < scale || newHeight < scale) {
        console.warn(
          `Snapping failed: resulting image size (${newWidth}x${newHeight}) is too small. Skipping snap.`
        )
      } else {
        const rect = new cv.Rect(crop.x, crop.y, newWidth, newHeight)
        const croppedMat = track(srcMat.roi(rect).clone())

        // Convert back to ImageData
        const canvas = document.createElement('canvas') // document.createElement is fine for this utility
        canvas.width = croppedMat.cols
        canvas.height = croppedMat.rows
        cv.imshow(canvas, croppedMat)
        current = canvas
          ?.getContext('2d', { willReadFrequently: true })
          ?.getImageData(0, 0, croppedMat.cols, croppedMat.rows)!
      }
    })
  }

  // 3. Optional Pre-Processing Cleanup
  if (cleanup.morph) {
    current = await morphologicalCleanup(current)
  }

  // 4. Color Quantization (before downscaling)
  const initialColors = countColors(current)
  let colorsUsed = initialColors
  let quantizeAfter = false

  // Auto-detect optimal color count if enabled
  let effectiveMaxColors = maxColors
  if (autoColorCount && initialColors > 2) {
    try {
      effectiveMaxColors = await detectOptimalColorCount(current, {
        downsampleTo: 64,
        colorQuantizeFactor: 48,
        dominanceThreshold: 0.015,
        maxColors: Math.min(maxColors, 32), // Cap at 32 for auto-detection
      })
    } catch (error) {
      effectiveMaxColors = maxColors
    }
  }

  if (downscaleMethod === 'content-adaptive') {
    // Don't quantize before downscaling
  } else if (effectiveMaxColors < 256 && initialColors > effectiveMaxColors) {
    const quantResult = quantizeImage(current, effectiveMaxColors, fixedPalette)
    current = quantResult.quantized
    colorsUsed = quantResult.colorsUsed
  }

  // 5. Downscaling
  if (scale > 1) {
    if (downscaleMethod === 'dominant') {
      current = downscaleByDominantColor(current, scale, domMeanThreshold)
    } else if (downscaleMethod === 'content-adaptive') {
      const targetW = Math.floor(originalSize[0] / scale)
      const targetH = Math.floor(originalSize[1] / scale)
      current = await contentAdaptiveDownscale(
        originalForAdaptiveScale,
        targetW,
        targetH
      )
      quantizeAfter = true
    } else if (
      ['median', 'mode', 'mean', 'nearest'].includes(downscaleMethod)
    ) {
      current = downscaleBlock(
        current,
        scale,
        scale,
        downscaleMethod,
        domMeanThreshold
      )
      quantizeAfter = true
    } else {
      current = downscaleBlock(
        current,
        scale,
        scale,
        'median',
        domMeanThreshold
      )
      quantizeAfter = true
    }
    current = finalizePixels(current)
  }

  // 6. Optional post-downscale quantization
  if (quantizeAfter && effectiveMaxColors < 256) {
    const quantResult = quantizeImage(current, effectiveMaxColors, fixedPalette)
    current = quantResult.quantized
    colorsUsed = quantResult.colorsUsed
  }

  // 6. Optional Post-Downscale Cleanup
  if (cleanup.jaggy) {
    current = jaggyCleaner(current)
  }

  if (!current?.width || !current?.height) {
    throw new Error('Processing resulted in an empty image.')
  }

  // 7. Encode to PNG
  const png = encodePng(current)
  const palette = getPaletteFromImage(current)

  // Generate processing manifest
  const manifest = {
    original_size: originalSize,
    final_size: [current.width, current.height] as [number, number],
    processing_steps: {
      scale_detection: {
        method: detectMethod,
        edge_method: manualScale
          ? null
          : detectMethod === 'edge' || detectMethod === 'auto'
          ? edgeDetectMethod
          : null,
        detected_scale: scale,
        manual_scale: manualScale,
      },
      color_quantization: {
        max_colors: maxColors,
        initial_colors: initialColors,
        final_colors: colorsUsed,
        fixed_palette: fixedPalette ? fixedPalette.length : null,
      },
      downscaling: {
        method: downscaleMethod,
        scale_factor: scale,
        dom_mean_threshold: domMeanThreshold,
        applied: scale > 1,
      },
      cleanup: {
        morphological: cleanup.morph,
        jaggy: cleanup.jaggy,
      },
      alpha_processing: {
        threshold: alphaThreshold,
        binarized: alphaThreshold !== null,
      },
      grid_snapping: {
        enabled: snapGrid,
        applied: snapGrid && scale > 1,
      },
    },
    processing_time_ms: Math.round(performance.now() - t0),
    timestamp: new Date().toISOString(),
  }

  return {
    png,
    imageData: current,
    palette,
    manifest,
  }
}

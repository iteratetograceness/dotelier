'use client'

const MAX_FILE_SIZE_MB = 50

/**
 * @fileoverview Shared utilities for pixel art and vector processing.
 * This file contains common functions used across the library for tasks like
 * image manipulation, color quantization, and mathematical calculations.
 */

import cvModule, { type CV, type Mat } from '@techstark/opencv-js'
import * as IQ from 'image-q'
import UPNG from 'upng-js'

// --- OpenCV Integration ------------------------------------------------------

async function getOpenCv() {
  let cv: CV

  if (cvModule instanceof Promise) {
    cv = await cvModule
  } else {
    if (cvModule.Mat) {
      cv = cvModule
    } else {
      await new Promise((resolve) => {
        cvModule.onRuntimeInitialized = () => resolve(true)
      })
      cv = cvModule
    }
  }
  return { cv }
}

export type TrackFn = <T extends { delete: () => void }>(mat: T) => T

/**
 * Resource management wrapper for OpenCV operations.
 * Ensures that OpenCV is ready and all created Mat objects are deleted.
 */
export async function withCv<T>(
  fn: (cv: CV, track: TrackFn) => Promise<T> | T
): Promise<T> {
  const { cv } = await getOpenCv()
  const mats = new Set<{ delete: () => void; isDeleted?: () => boolean }>()

  const track: TrackFn = (mat) => {
    mats.add(mat)
    return mat
  }

  try {
    return await fn(cv, track)
  } finally {
    for (const mat of mats) {
      if (!mat.isDeleted?.()) mat.delete()
    }
  }
}

/**
 * Ensures OpenCV is ready and returns the `cv` namespace.
 */
export const cvReady = getOpenCv

// --- Image Loading and Conversion --------------------------------------------

/**
 * Reads a user-supplied File/Blob into an ImageData object
 */
export async function fileToImageData(
  file: File | Blob
): Promise<ImageData | undefined> {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(
        1
      )}MB. Max ${MAX_FILE_SIZE_MB}MB.`
    )
  }

  const bitmap: ImageBitmap | unknown = await Promise.race([
    createImageBitmap(file),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Image loading timeout')), 30000)
    ),
  ])
  console.log(bitmap)

  const isImageBitmap = bitmap instanceof ImageBitmap

  if (!isImageBitmap) {
    throw new Error('Failed to load image')
  }

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(bitmap.width, bitmap.height)
      : document.createElement('canvas')

  const isOffscreenCanvas = canvas instanceof OffscreenCanvas

  if (!isOffscreenCanvas) {
    canvas.width = bitmap.width
    canvas.height = bitmap.height
  }

  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D | null

  ctx?.drawImage(bitmap, 0, 0)
  return ctx?.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Encodes ImageData to a PNG buffer using UPNG.js
 */
export function encodePng(imgData: ImageData): Uint8Array {
  const buffer = UPNG.encode(
    [imgData.data.buffer],
    imgData.width,
    imgData.height,
    0
  )
  return new Uint8Array(buffer)
}

// --- Image Processing and Cleanup --------------------------------------------

/**
 * Applies morphological cleanup to an image.
 * Uses OPEN to remove noise and CLOSE to fill small gaps.
 */
export async function morphologicalCleanup(
  imgData: ImageData
): Promise<ImageData> {
  return withCv((cv, track) => {
    const mat = track(cv.matFromImageData(imgData))
    const kernel = track(cv.Mat.ones(2, 2, cv.CV_8U)) // 2x2 for finer details

    // OPEN operation removes noise and small artifacts
    cv.morphologyEx(mat, mat, cv.MORPH_OPEN, kernel)

    // CLOSE operation fills small gaps and smooths jagged edges
    cv.morphologyEx(mat, mat, cv.MORPH_CLOSE, kernel)

    return new ImageData(new Uint8ClampedArray(mat.data), mat.cols, mat.rows)
  })
}

/**
 * Converts the alpha channel to binary (0 or 255) based on a threshold.
 */
export function alphaBinarization(
  imgData: ImageData,
  threshold: number = 128
): ImageData {
  const { data, width, height } = imgData
  const out = new Uint8ClampedArray(data)

  for (let i = 3; i < out.length; i += 4) {
    out[i] = out[i] >= threshold ? 255 : 0
  }

  return new ImageData(out, width, height)
}

/**
 * Removes isolated diagonal pixels ("jaggies") from pixel art.
 */
export function jaggyCleaner(imgData: ImageData): ImageData {
  const { data, width, height } = imgData
  const out = new Uint8ClampedArray(data)

  const get = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null
    const i = (y * width + x) * 4
    return { r: out[i], g: out[i + 1], b: out[i + 2], a: out[i + 3] }
  }

  const set = (
    x: number,
    y: number,
    color: { r: number; g: number; b: number; a: number }
  ) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const i = (y * width + x) * 4
    Object.assign(out, [color.r, color.g, color.b, color.a], i)
  }

  const isOpaque = (
    p: { r: number; g: number; b: number; a: number } | null
  ): number => (p !== null && p.a > 128 ? 1 : 0)

  // Apply rule-based cleaning for orphaned diagonal pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isOpaque(get(x, y))) continue

      const N = isOpaque(get(x, y - 1))
      const S = isOpaque(get(x, y + 1))
      const E = isOpaque(get(x + 1, y))
      const W = isOpaque(get(x - 1, y))
      const NE = isOpaque(get(x + 1, y - 1))
      const NW = isOpaque(get(x - 1, y - 1))
      const SE = isOpaque(get(x + 1, y + 1))
      const SW = isOpaque(get(x - 1, y + 1))

      const opaqueOrth = N + S + E + W
      const opaqueDiag = NE + NW + SE + SW

      // Remove pixel if it has no orthogonal neighbors + only one diagonal one
      if (opaqueOrth === 0 && opaqueDiag === 1) {
        set(x, y, { r: 0, g: 0, b: 0, a: 0 })
      }
    }
  }

  return new ImageData(out, width, height)
}

/**
 * Ensures final pixels have binary alpha and transparent pixels are black.
 */
export function finalizePixels(imgData: ImageData): ImageData {
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0
    } else {
      data[i + 3] = 255
    }
  }
  return imgData
}

// --- Color and Palette -------------------------------------------------------

/**
 * Automatically detects the optimal number of colors in an image.
 * Uses aggressive clustering and dominant color analysis.
 */
export async function detectOptimalColorCount(
  imgData: ImageData,
  {
    downsampleTo = 64,
    colorQuantizeFactor = 48,
    dominanceThreshold = 0.015,
    maxColors = 32,
  }: {
    downsampleTo?: number
    colorQuantizeFactor?: number
    dominanceThreshold?: number
    maxColors?: number
  } = {}
): Promise<number> {
  return withCv(async (cv, track) => {
    const src = track(cv.matFromImageData(imgData))

    // Downsample for faster analysis
    const aspectRatio = src.rows / src.cols
    const targetWidth = downsampleTo
    const targetHeight = Math.round(targetWidth * aspectRatio)
    const dsize = new cv.Size(targetWidth, targetHeight)
    const smallMat = track(new cv.Mat())
    cv.resize(src, smallMat, dsize, 0, 0, cv.INTER_AREA)

    // Blur to remove noise and gradients
    cv.medianBlur(smallMat, smallMat, 5)
    cv.GaussianBlur(smallMat, smallMat, new cv.Size(5, 5), 1, 1)

    // Gather color statistics with aggressive quantization
    const colorCounts = new Map()
    const totalPixels = smallMat.rows * smallMat.cols
    const d = smallMat.data

    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue // Ignore transparent pixels

      const r = Math.round(d[i] / colorQuantizeFactor) * colorQuantizeFactor
      const g = Math.round(d[i + 1] / colorQuantizeFactor) * colorQuantizeFactor
      const b = Math.round(d[i + 2] / colorQuantizeFactor) * colorQuantizeFactor

      const colorKey = `${r},${g},${b}`
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1)
    }

    // Analyze for dominant colors
    const minPixelsForDominance = Math.max(
      3,
      Math.round(totalPixels * dominanceThreshold)
    )

    const sortedColors = Array.from(colorCounts.entries()).filter(
      ([, count]) => count >= minPixelsForDominance
    )

    let significantColors = sortedColors.length

    // If there are too many colors, apply a stricter threshold
    if (significantColors > maxColors) {
      const strictThreshold = Math.max(
        minPixelsForDominance,
        Math.round(totalPixels * 0.02)
      )
      significantColors = sortedColors.filter(
        ([, count]) => count >= strictThreshold
      ).length
    }

    const result = Math.max(2, Math.min(significantColors, maxColors))
    return result
  })
}

/**
 * Quantizes image colors using image-q library with a fallback.
 */
export function quantizeImage(
  imgData: ImageData,
  maxColors: number,
  fixedPalette: string[] | null = null
): {
  quantized: ImageData
  colorsUsed: number
  palette: { r: number; g: number; b: number; a: number }[]
} {
  try {
    const inPointContainer = IQ.utils.PointContainer.fromImageData(imgData)
    const palette = fixedPalette?.length
      ? new IQ.utils.Palette()
      : IQ.buildPaletteSync([inPointContainer], {
          colors: maxColors,
          colorDistanceFormula: 'euclidean',
          paletteQuantization: 'wuquant',
        })

    if (fixedPalette?.length) {
      for (const hex of fixedPalette) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        palette.add(IQ.utils.Point.createByRGBA(r, g, b, 255))
      }
    }

    const outPointContainer = IQ.applyPaletteSync(inPointContainer, palette, {
      imageQuantization: 'nearest',
    })
    const quantized = new ImageData(
      new Uint8ClampedArray(outPointContainer.toUint8Array()),
      imgData.width,
      imgData.height
    )

    // Extract palette in {r, g, b, a} format for tracers
    const tracerPalette = palette
      .getPointContainer()
      .getPointArray()
      .map((p) => ({
        r: Math.round(p.r),
        g: Math.round(p.g),
        b: Math.round(p.b),
        a: Math.round(p.a),
      }))

    return {
      quantized: finalizePixels(quantized),
      colorsUsed: tracerPalette.length,
      palette: tracerPalette,
    }
  } catch (error) {
    const { data, width, height } = imgData
    const result = new Uint8ClampedArray(data.length)
    const step = 256 / Math.max(1, maxColors - 1)
    for (let i = 0; i < data.length; i += 4) {
      result[i] = Math.round(data[i] / step) * step
      result[i + 1] = Math.round(data[i + 1] / step) * step
      result[i + 2] = Math.round(data[i + 2] / step) * step
      result[i + 3] = data[i + 3]
    }
    const quantized = finalizePixels(new ImageData(result, width, height))
    const palette = getPaletteAsObjects(quantized)

    return {
      quantized,
      colorsUsed: palette.length,
      palette,
    }
  }
}

/**
 * Counts the number of unique opaque colors in an ImageData object.
 * @param {ImageData} imgData The image data.
 * @returns {number} The count of unique colors.
 */
export function countColors(imgData: ImageData): number {
  const seen = new Set()
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 128) {
      // Count only opaque colors
      seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])
    }
    if (seen.size > 256) break // Optimization for many-colored images
  }
  return seen.size
}

/**
 * Extracts the unique colors from an ImageData object into an array of objects.
 */
export function getPaletteAsObjects(
  imgData: ImageData
): { r: number; g: number; b: number; a: number }[] {
  const seen = new Set()
  const palette = []
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2],
      a = d[i + 3]
    if (a > 128) {
      // Count only opaque colors
      const key = `${r}|${g}|${b}|${a}`
      if (!seen.has(key)) {
        seen.add(key)
        palette.push({ r, g, b, a })
      }
    }
  }
  return palette
}

/**
 * Extracts the unique colors from an ImageData object into a hex palette.
 */
export function getPaletteFromImage(imgData: ImageData): string[] {
  const seen: Set<number> = new Set()
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    seen.add((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3])
  }
  const toHex = (val: number): string => val.toString(16).padStart(2, '0')
  return Array.from(seen).map((key) => {
    const r = key >>> 24
    const g = (key >>> 16) & 0xff
    const b = (key >>> 8) & 0xff
    const a = key & 0xff
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`
  })
}

// --- Scaling and Resampling --------------------------------------------------

/**
 * Detects pixel grid scale from a signal using peak analysis.
 */
export function detectScale(signal: number[]): number {
  if (signal.length < 3) return 1

  const meanVal = signal.reduce((a, b) => a + b, 0) / signal.length
  const std = Math.sqrt(
    signal.reduce((a, b) => a + (b - meanVal) ** 2, 0) / signal.length
  )
  const threshold = meanVal + 1.5 * std

  const peaks: number[] = []
  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > threshold &&
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1]
    ) {
      // Ensure peaks are spaced out
      if (peaks.length === 0 || i - peaks[peaks.length - 1] > 2) {
        peaks.push(i)
      }
    }
  }

  if (peaks.length <= 2) {
    return 1
  }

  const spacings = peaks.slice(1).map((p, i) => p - peaks[i])

  // Heuristic: if most spacings are close to the median, use the median.
  const medianSpacing = median(spacings)
  const closeSpacings = spacings.filter((s) => Math.abs(s - medianSpacing) <= 2)

  if (closeSpacings.length / spacings.length > 0.7) {
    return Math.round(medianSpacing)
  }

  // Otherwise, return the mode as a fallback.
  const modeSpacing = mode(spacings)
  return modeSpacing > 1 ? modeSpacing : 1
}

/**
 * Finds the optimal crop offset to align an image with a pixel grid.
 */
export function findOptimalCrop(
  grayMat: Mat,
  scale: number,
  cv: CV
): { x: number; y: number } {
  const sobelX = new cv.Mat()
  const sobelY = new cv.Mat()

  try {
    cv.Sobel(grayMat, sobelX, cv.CV_32F, 1, 0, 3)
    cv.Sobel(grayMat, sobelY, cv.CV_32F, 0, 1, 3)

    const profileX = new Float32Array(grayMat.cols).fill(0)
    const profileY = new Float32Array(grayMat.rows).fill(0)
    const dataX = sobelX.data32F
    const dataY = sobelY.data32F

    for (let y = 0; y < grayMat.rows; y++) {
      for (let x = 0; x < grayMat.cols; x++) {
        const idx = y * grayMat.cols + x
        profileX[x] += Math.abs(dataX[idx])
        profileY[y] += Math.abs(dataY[idx])
      }
    }

    const findBestOffset = (
      profile: Float32Array<ArrayBuffer>,
      s: number
    ): number => {
      let bestOffset = 0,
        maxScore = -1
      for (let offset = 0; offset < s; offset++) {
        let currentScore = 0
        for (let i = offset; i < profile.length; i += s) {
          currentScore += profile[i] || 0
        }
        if (currentScore > maxScore) {
          maxScore = currentScore
          bestOffset = offset
        }
      }
      return bestOffset
    }

    const bestDx = findBestOffset(profileX, scale)
    const bestDy = findBestOffset(profileY, scale)
    return { x: bestDx, y: bestDy }
  } finally {
    sobelX.delete()
    sobelY.delete()
  }
}

/**
 * Downscales an image by sampling pixels within blocks.
 */
export function downscaleBlock(
  imgData: ImageData,
  hScale: number,
  vScale: number,
  method: 'median' | 'mode' | 'mean' | 'domMean' | 'nearest' = 'median',
  domMeanThreshold: number = 0.05
): ImageData {
  const targetW = Math.floor(imgData.width / hScale)
  const targetH = Math.floor(imgData.height / vScale)
  if (targetW <= 0 || targetH <= 0) return new ImageData(1, 1)

  const out = new Uint8ClampedArray(targetW * targetH * 4)
  const d = imgData.data

  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const offset = (ty * targetW + tx) * 4

      if (method === 'nearest') {
        const sx = tx * hScale + Math.floor(hScale / 2)
        const sy = ty * vScale + Math.floor(vScale / 2)
        if (sx < imgData.width && sy < imgData.height) {
          const idx = (sy * imgData.width + sx) * 4
          out[offset] = d[idx]
          out[offset + 1] = d[idx + 1]
          out[offset + 2] = d[idx + 2]
          out[offset + 3] = d[idx + 3]
        }
        continue
      }

      const colorsR = [],
        colorsG = [],
        colorsB = [],
        colorsA = []

      for (let dy = 0; dy < vScale; dy++) {
        for (let dx = 0; dx < hScale; dx++) {
          const sx = tx * hScale + dx,
            sy = ty * vScale + dy
          if (sx >= imgData.width || sy >= imgData.height) continue

          const idx = (sy * imgData.width + sx) * 4
          if (d[idx + 3] > 128) {
            // Only consider mostly opaque pixels for color
            colorsR.push(d[idx])
            colorsG.push(d[idx + 1])
            colorsB.push(d[idx + 2])
          }
          colorsA.push(d[idx + 3]) // Always consider alpha for aggregation
        }
      }

      if (colorsA.length === 0) continue

      const hasColor = colorsR.length > 0

      let aggregator
      switch (method) {
        // case 'nearest' is handled above
        case 'mode':
          aggregator = mode
          break
        case 'mean':
          aggregator = mean
          break
        case 'median':
          aggregator = median
          break
        case 'domMean':
          aggregator = (colors: number[]) =>
            dominantOrMean(colors, domMeanThreshold)
          break
        default:
          aggregator = median
      }

      out[offset] = hasColor ? aggregator(colorsR) : 0
      out[offset + 1] = hasColor ? aggregator(colorsG) : 0
      out[offset + 2] = hasColor ? aggregator(colorsB) : 0
      // Median is robust for alpha to preserve hard edges
      out[offset + 3] = median(colorsA)
    }
  }
  return new ImageData(out, targetW, targetH)
}

// --- Math Helpers ------------------------------------------------------------

export const median = (arr: number[]): number => {
  if (arr.length === 0) return 0
  const mid = Math.floor(arr.length / 2)
  const sorted = [...arr].sort((a, b) => a - b)
  return arr.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

export const mode = (arr: number[]): number => {
  if (arr.length === 0) return 0
  const counts: Record<number, number> = {}
  let max = 0,
    res = arr[0]
  for (const v of arr) {
    counts[v] = (counts[v] || 0) + 1
    if (counts[v] > max) {
      max = counts[v]
      res = v
    }
  }
  return res
}

export const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

/**
 * Uses dominant color if frequent enough, otherwise falls back to the mean.
 */
export function dominantOrMean(
  arr: number[],
  threshold: number = 0.05
): number {
  if (arr.length === 0) return 0
  const freq: Record<number, number> = {}
  arr.forEach((v) => (freq[v] = (freq[v] || 0) + 1))

  const [dominant, count] = Object.entries(freq).reduce(
    (best: [string | null, number], cur: [string, number]) =>
      cur[1] > best[1] ? cur : best,
    [null, 0]
  )

  if (dominant !== null && count / arr.length >= threshold) {
    return +dominant
  }
  return mean(arr)
}

/**
 * Calculates the Greatest Common Divisor (GCD) of an array of numbers.
 */
export function gcdArray(arr: number[]): number {
  if (!arr.length) return 1
  let result = arr[0]
  for (let i = 1; i < arr.length; i++) {
    result = gcd(result, arr[i])
    if (result === 1) return 1 // Early exit
  }
  return result
}

/**
 * Calculates the GCD of two numbers using the Euclidean algorithm.
 */
function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/**
 * Multiplies two 2x2 matrices (a * b).
 */
export function multiply2x2(a: number[][], b: number[][]): number[][] {
  const [a00, a01] = a[0]
  const [a10, a11] = a[1]
  const [b00, b01] = b[0]
  const [b10, b11] = b[1]
  return [
    [a00 * b00 + a01 * b10, a00 * b01 + a01 * b11],
    [a10 * b00 + a11 * b10, a10 * b01 + a11 * b11],
  ]
}

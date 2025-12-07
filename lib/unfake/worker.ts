/**
 * Web Worker for offloading heavy image processing from the main thread.
 * This worker runs processImage in a separate thread to prevent UI blocking.
 */

/* eslint-disable no-restricted-globals */

import { processImage } from './pixel'
import { cvReady } from './utils'

// Types for worker communication
export interface ProcessImageOptions {
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
}

export interface WorkerMessage {
  type: 'process'
  id: string
  file: Blob
  options: ProcessImageOptions
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'ready'
  id: string
  result?: {
    imageData: ImageData
    palette: string[]
    manifest: {
      original_size: [number, number]
      final_size: [number, number]
    }
  }
  error?: string
}

// Pre-initialize OpenCV on worker start
let cvReady_: boolean = false
let cvInitPromise: Promise<void> | null = null

async function ensureCvReady(): Promise<void> {
  if (cvReady_) return

  if (!cvInitPromise) {
    cvInitPromise = cvReady().then(() => {
      cvReady_ = true
      console.log('[UnfakeWorker] OpenCV initialized')
    })
  }

  await cvInitPromise
}

// Start initializing OpenCV immediately
ensureCvReady().then(() => {
  // Notify main thread that worker is ready
  const response: WorkerResponse = {
    type: 'ready',
    id: 'init',
  }
  self.postMessage(response)
})

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id, file, options } = e.data

  if (type !== 'process') {
    console.warn('[UnfakeWorker] Unknown message type:', type)
    return
  }

  try {
    // Wait for OpenCV to be ready
    await ensureCvReady()

    console.log('[UnfakeWorker] Processing image, id:', id)
    const startTime = performance.now()

    const result = await processImage({
      file,
      ...options,
    })

    const processingTime = Math.round(performance.now() - startTime)
    console.log('[UnfakeWorker] Processing complete in', processingTime, 'ms')

    // Transfer ImageData buffer for zero-copy
    const response: WorkerResponse = {
      type: 'result',
      id,
      result: {
        imageData: result.imageData,
        palette: result.palette,
        manifest: {
          original_size: result.manifest.original_size,
          final_size: result.manifest.final_size,
        },
      },
    }

    // Use transferable objects for efficient data transfer
    self.postMessage(response, [result.imageData.data.buffer])
  } catch (error) {
    console.error('[UnfakeWorker] Processing error:', error)

    const response: WorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    self.postMessage(response)
  }
}

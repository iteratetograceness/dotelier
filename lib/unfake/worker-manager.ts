'use client'

/**
 * Manager for the unfake Web Worker.
 * Provides a Promise-based API for image processing on a background thread.
 */

import type {
  ProcessImageOptions,
  WorkerMessage,
  WorkerResponse,
} from './worker'

export interface ProcessResult {
  imageData: ImageData
  palette: string[]
  manifest: {
    original_size: [number, number]
    final_size: [number, number]
  }
}

type PendingRequest = {
  resolve: (result: ProcessResult) => void
  reject: (error: Error) => void
}

class UnfakeWorkerManager {
  private worker: Worker | null = null
  private pending = new Map<string, PendingRequest>()
  private idCounter = 0
  private workerReady = false
  private readyPromise: Promise<void> | null = null
  private readyResolve: (() => void) | null = null

  /**
   * Get or create the worker instance.
   * Uses dynamic import with URL for Next.js bundler compatibility.
   */
  private getWorker(): Worker {
    if (!this.worker) {
      // Create promise for ready state
      this.readyPromise = new Promise((resolve) => {
        this.readyResolve = resolve
      })

      // Create worker with module type for ES modules support
      this.worker = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = this.handleMessage.bind(this)
      this.worker.onerror = this.handleError.bind(this)

      console.log('[UnfakeWorkerManager] Worker created')
    }
    return this.worker
  }

  /**
   * Wait for the worker to be ready (OpenCV initialized).
   */
  private async waitForReady(): Promise<void> {
    this.getWorker()
    if (this.workerReady) return
    await this.readyPromise
  }

  /**
   * Handle messages from the worker.
   */
  private handleMessage(e: MessageEvent<WorkerResponse>) {
    const { type, id, result, error } = e.data

    // Handle ready signal
    if (type === 'ready') {
      console.log('[UnfakeWorkerManager] Worker ready')
      this.workerReady = true
      this.readyResolve?.()
      return
    }

    // Handle processing results
    const pending = this.pending.get(id)
    if (!pending) {
      console.warn('[UnfakeWorkerManager] No pending request for id:', id)
      return
    }

    this.pending.delete(id)

    if (type === 'error') {
      pending.reject(new Error(error || 'Unknown worker error'))
    } else if (type === 'result' && result) {
      pending.resolve(result)
    }
  }

  /**
   * Handle worker errors.
   */
  private handleError(e: ErrorEvent) {
    console.error('[UnfakeWorkerManager] Worker error:', e.message)

    // Reject all pending requests
    for (const [id, pending] of this.pending) {
      pending.reject(new Error(`Worker error: ${e.message}`))
      this.pending.delete(id)
    }

    // Recreate worker on error
    this.worker?.terminate()
    this.worker = null
    this.workerReady = false
    this.readyPromise = null
    this.readyResolve = null
  }

  /**
   * Process an image using the Web Worker.
   * Returns a Promise that resolves with the processing result.
   */
  async process(
    file: Blob,
    options: ProcessImageOptions = {}
  ): Promise<ProcessResult> {
    // Ensure worker is ready
    await this.waitForReady()

    const id = `req_${++this.idCounter}_${Date.now()}`
    const worker = this.getWorker()

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })

      const message: WorkerMessage = {
        type: 'process',
        id,
        file,
        options,
      }

      console.log('[UnfakeWorkerManager] Sending process request, id:', id)
      worker.postMessage(message)
    })
  }

  /**
   * Check if the worker is ready for processing.
   */
  isReady(): boolean {
    return this.workerReady
  }

  /**
   * Pre-warm the worker by initializing it early.
   * Call this on page load to reduce first-request latency.
   */
  async warmup(): Promise<void> {
    await this.waitForReady()
  }

  /**
   * Terminate the worker and free resources.
   */
  terminate(): void {
    if (this.worker) {
      // Reject any pending requests
      for (const [id, pending] of this.pending) {
        pending.reject(new Error('Worker terminated'))
        this.pending.delete(id)
      }

      this.worker.terminate()
      this.worker = null
      this.workerReady = false
      this.readyPromise = null
      this.readyResolve = null

      console.log('[UnfakeWorkerManager] Worker terminated')
    }
  }
}

// Export singleton instance
export const unfakeWorker = new UnfakeWorkerManager()

// Also export class for testing or multiple instances
export { UnfakeWorkerManager }

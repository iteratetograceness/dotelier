/**
 * Based off https://github.com/iam-medvedev/eyedropper-polyfill
 */

import { track } from '@vercel/analytics/react'
import { Magnifier } from './magnifier'

interface ColorSelectionOptions {
  signal?: AbortSignal
}

interface ColorSelectionResult {
  sRGBHex: string
}

interface EyeDropper {
  open(options?: ColorSelectionOptions): Promise<ColorSelectionResult>
}

export interface Point {
  x: number
  y: number
}

/** Global `isOpen` state */
const isOpenState = {
  value: false,
}

/**
 * EyeDropper API polyfill
 * https://wicg.github.io/eyedropper-api/#dom-colorselectionoptions
 */
export class EyeDropperPolyfill implements EyeDropper {
  private colorSelectionResult?: ColorSelectionResult
  private previousDocumentCursor?: CSSStyleDeclaration['cursor']
  private canvas?: HTMLCanvasElement
  private canvasCtx?: CanvasRenderingContext2D | null
  private resolve?: (result: ColorSelectionResult) => void
  private magnifier?: Magnifier
  private animationFrameId?: number
  private pointer?: Point

  constructor(private targetCanvas: HTMLCanvasElement) {
    this.canvas = targetCanvas
    this.canvasCtx = targetCanvas.getContext('2d', { willReadFrequently: true })
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    // this.onClick = this.onClick.bind(this)
  }

  /**
   * Opens the polyfilled eyedropper
   *
   * §3.3 EyeDropper interface ► `open()`
   */
  public async open(
    options: ColorSelectionOptions = {}
  ): Promise<ColorSelectionResult> {
    // §3.3 EyeDropper interface ► `open()` ► p.2
    // Prevent opening if already open
    if (isOpenState.value) {
      return Promise.reject(
        new DOMException('Invalid state', 'InvalidStateError')
      )
    }

    // §3.3 EyeDropper interface ► `open()` ► p.3
    // Create a promise to handle the color selection
    const result = new Promise<ColorSelectionResult>((resolve, reject) => {
      // §3.3 EyeDropper interface ► `open()` ► p.4
      // Handle possible signal abortion
      if (options.signal) {
        if (options.signal.aborted) {
          this.stop()

          return reject(
            options.signal.reason || new DOMException('Aborted', 'AbortError')
          )
        }

        const abortListener = () => {
          this.stop()
          if (options.signal) {
            reject(
              options.signal.reason || new DOMException('Aborted', 'AbortError')
            )
          }
        }

        options.signal.addEventListener('abort', abortListener)
      }

      // §3.3 EyeDropper interface ► `open()` ► p.5
      // Store the resolve function and start the eyedropper
      this.resolve = resolve
      this.start()
    })

    return result
  }

  /**
   * Starting eyedropper mode
   */
  private async start() {
    document.body.style.overflow = 'hidden'
    this.setWaitingCursor()
    this.revertWaitingCursor()
    this.bindEvents()

    this.magnifier = new Magnifier(this.canvas)
    this.tick()
  }

  private tick = () => {
    if (this.pointer && this.magnifier) {
      this.magnifier.move(this.pointer)
      this.detectColor(this.pointer)
    }
    this.animationFrameId = requestAnimationFrame(this.tick)
  }

  /**
   * Stopping eyedropper mode
   */
  private stop() {
    document.body.style.overflow = ''
    this.unbindEvents()
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId)
    this.magnifier?.destroy()
    this.colorSelectionResult = undefined
    isOpenState.value = false
  }

  /**
   * Sets waiting cursor
   */
  private setWaitingCursor() {
    this.previousDocumentCursor = document.documentElement.style.cursor
    document.documentElement.style.cursor = 'wait'
  }

  /**
   * Removes waiting cursor
   */
  private revertWaitingCursor() {
    if (this.previousDocumentCursor) {
      document.documentElement.style.cursor = this.previousDocumentCursor
    } else {
      document.documentElement.style.cursor = ''
    }

    this.previousDocumentCursor = undefined
  }

  /**
   * Binds events
   */
  private bindEvents() {
    const options = { passive: false, capture: true }

    this.canvas?.addEventListener('mousedown', this.onClick, options)
    this.canvas?.addEventListener('mousemove', this.onMouseMove, options)
    window.addEventListener('mouseup', this.onClick, options)

    this.canvas?.addEventListener('touchstart', this.onClick, options)
    this.canvas?.addEventListener('touchmove', this.onTouchMove, options)
    window.addEventListener('touchend', this.onClick, options)

    document.body.style.touchAction = 'none'
  }

  /**
   * Unbinds `mousemove` events
   */
  private unbindEvents() {
    const options = { passive: false, capture: true }

    this.canvas?.removeEventListener('mousedown', this.onClick, options)
    this.canvas?.removeEventListener('mousemove', this.onMouseMove, options)
    window.removeEventListener('mouseup', this.onClick, options)

    this.canvas?.removeEventListener('touchstart', this.onClick, options)
    this.canvas?.removeEventListener('touchmove', this.onTouchMove, options)
    window.removeEventListener('touchend', this.onClick, options)

    document.body.style.touchAction = ''
  }

  private getCanvasRelativePosition(
    clientX: number,
    clientY: number
  ): Point | null {
    const rect = this.targetCanvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const canvasX = (x * this.targetCanvas.width) / rect.width
      const canvasY = (y * this.targetCanvas.height) / rect.height
      return { x: canvasX, y: canvasY }
    }

    return null
  }

  /**
   * `click` handler
   */
  private onClick = (event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    if (this.pointer && this.colorSelectionResult && this.resolve) {
      this.resolve(this.colorSelectionResult)
    }
    this.stop()
  }

  /**
   * `mousemove` handler
   */
  private onMouseMove(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    const pos = this.getCanvasRelativePosition(event.clientX, event.clientY)
    if (pos) {
      this.pointer = pos
    } else {
      this.pointer = undefined // Clear pointer when outside canvas
    }
  }

  /**
   * `touchmove` handler
   */
  private onTouchMove(event: TouchEvent) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    const touch = event.touches[0]
    if (touch) {
      const pos = this.getCanvasRelativePosition(touch.clientX, touch.clientY)
      if (pos) {
        this.pointer = pos
      } else {
        this.pointer = undefined
      }
      //   this.pointer = {
      //     x: (touch.clientX + window.scrollX) * window.devicePixelRatio,
      //     y: (touch.clientY + window.scrollY) * window.devicePixelRatio,
      //   }
    }
  }

  /**
   * Detects color from canvas data
   */
  private detectColor(point: Point) {
    try {
      if (!this.canvasCtx || !this.canvas) {
        track('eyedropper-polyfill-detect-color-failed')
        return
      }

      const x = Math.min(Math.max(point.x, 0), this.canvas.width - 1)
      const y = Math.min(Math.max(point.y, 0), this.canvas.height - 1)

      const pixelData = this.canvasCtx.getImageData(x, y, 1, 1).data

      const red = pixelData[0]
      const green = pixelData[1]
      const blue = pixelData[2]

      const hex = ((1 << 24) + (red << 16) + (green << 8) + blue)
        .toString(16)
        .slice(1)

      this.colorSelectionResult = { sRGBHex: `#${hex}` }
    } catch (e) {
      track('eyedropper-polyfill-detect-color-failed', {
        error: JSON.stringify(e),
      })
    }
  }
}

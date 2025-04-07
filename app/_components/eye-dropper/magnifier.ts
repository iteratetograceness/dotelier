import { Point } from './polyfill'

/**
 * Creates a magnifying glass effect
 */
export class Magnifier {
  private originalCanvas: HTMLCanvasElement
  private canvas: HTMLCanvasElement
  private canvasCtx: CanvasRenderingContext2D
  private magnification: number
  private radius: number

  constructor(
    originalCanvas?: HTMLCanvasElement,
    magnification = 10,
    radius = 75,
    private borderColor = '#000000',
    private padding = 2
  ) {
    if (!originalCanvas) throw new Error('Original canvas missing')

    this.originalCanvas = originalCanvas
    this.magnification = magnification
    this.radius = radius

    const size = radius * 2
    this.canvas = document.createElement('canvas')

    this.canvas.width = size + padding * 2
    this.canvas.height = size + padding * 2

    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${size + padding * 2}px`,
      height: `${size + padding * 2}px`,
      pointerEvents: 'none',
      zIndex: 1000001,
      '-webkit-transform': 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)',
      willChange: 'transform',
      '-webkit-backface-visibility': 'hidden',
      backfaceVisibility: 'hidden',
    })

    document.body.appendChild(this.canvas)

    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas context missing')
    this.canvasCtx = ctx
  }

  /**
   * Moves magnifier
   */
  public move(point: Point) {
    const radius = this.radius
    const rect = this.originalCanvas.getBoundingClientRect()

    const screenX =
      (point.x * rect.width) / this.originalCanvas.width + rect.left
    const screenY =
      (point.y * rect.height) / this.originalCanvas.height + rect.top

    this.canvas.style.left = `${screenX}px`
    this.canvas.style.top = `${screenY}px`

    const sourceSize = (radius * 2) / this.magnification
    const sx = Math.max(0, point.x - sourceSize / 2)
    const sy = Math.max(0, point.y - sourceSize / 2)
    const sw = Math.min(sourceSize, this.originalCanvas.width - sx)
    const sh = Math.min(sourceSize, this.originalCanvas.height - sy)

    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvasCtx.save()
    this.canvasCtx.translate(this.padding, this.padding)
    this.canvasCtx.beginPath()
    this.canvasCtx.arc(radius, radius, radius, 0, 2 * Math.PI)
    this.canvasCtx.clip()

    this.canvasCtx.drawImage(
      this.originalCanvas,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      radius * 2,
      radius * 2
    )

    this.canvasCtx.restore()

    // Draw border
    this.canvasCtx.save()
    this.canvasCtx.translate(this.padding, this.padding)
    this.canvasCtx.strokeStyle = this.borderColor
    this.canvasCtx.lineWidth = 2
    this.canvasCtx.beginPath()
    this.canvasCtx.arc(radius, radius, radius, 0, 2 * Math.PI)
    this.canvasCtx.stroke()
    this.canvasCtx.restore()
  }

  /**
   * Instance cleanup
   */
  public destroy() {
    this.canvas.remove()
  }
}

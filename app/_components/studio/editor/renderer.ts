import { Point } from './shapes'

export type Color = [number, number, number, number]

export class PixelRenderer {
  private ctx: CanvasRenderingContext2D
  private gridSize: number
  private gridItemSize: number
  private _pixelData?: Uint8ClampedArray

  private offscreen: HTMLCanvasElement
  private offCtx: CanvasRenderingContext2D
  private needsRedraw = false
  private showGrid = true
  private animationFrameId?: number

  constructor(private canvas: HTMLCanvasElement, private _gridSize: number) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')
    this.ctx = ctx

    this.gridSize = _gridSize
    this.gridItemSize = this.canvas.height / _gridSize
    this.canvas.style.imageRendering = 'pixelated'

    this.offscreen = document.createElement('canvas')
    this.offscreen.width = _gridSize
    this.offscreen.height = _gridSize
    const offCtx = this.offscreen.getContext('2d')
    if (!offCtx) throw new Error('Failed to get offscreen context')
    this.offCtx = offCtx
  }

  public set pixelData(pixelData: Uint8ClampedArray) {
    this._pixelData = pixelData
    this.markDirty()
  }

  public get pixelData(): Uint8ClampedArray | undefined {
    return this._pixelData
  }

  public setGridSize(newSize: number): void {
    this.gridSize = newSize
    this._gridSize = newSize
    this.gridItemSize = this.canvas.height / newSize
    this.offscreen.width = newSize
    this.offscreen.height = newSize
    this.markDirty()
  }

  public getGridSize(): number {
    return this.gridSize
  }

  private markDirty() {
    this.needsRedraw = true
  }

  public requestRedraw() {
    this.markDirty()
    // Restart render loop if it stopped
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop)
    }
  }

  public startRenderLoop() {
    if (this.animationFrameId) return
    this.renderLoop()
  }

  public stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = undefined
    }
  }

  public renderLoop = () => {
    if (this.needsRedraw) {
      this.needsRedraw = false
      if (this.pixelData) this.redraw(this.pixelData)
      // Continue loop only if there are more changes
      this.animationFrameId = requestAnimationFrame(this.renderLoop)
    } else {
      // Stop loop when idle to save CPU
      this.animationFrameId = undefined
    }
  }

  public destroy() {
    this.stopRenderLoop()
    this.clear()
    this._pixelData = undefined
  }

  private getFillStyle(color: Color) {
    return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.offCtx.clearRect(0, 0, this.offscreen.width, this.offscreen.height)
  }

  public drawPixel(x: number, y: number, color: Color) {
    this.ctx.fillStyle = this.getFillStyle(color)
    const pixelSize = this.canvas.width / this.gridSize
    this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
  }

  public drawPixels(pixels: Point[], color: Color) {
    for (const pixel of pixels) {
      this.drawPixel(pixel.x, pixel.y, color)
    }
  }

  public redraw(pixelData: Uint8ClampedArray) {
    const imageData = this.offCtx.createImageData(this.gridSize, this.gridSize)
    imageData.data.set(pixelData)
    this.offCtx.putImageData(imageData, 0, 0)

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.imageSmoothingEnabled = false
    this.ctx.drawImage(
      this.offscreen,
      0,
      0,
      this.gridSize,
      this.gridSize,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )

    if (this.showGrid) this.drawGridLines()
  }

  private drawGridLines() {
    const step = this.canvas.width / this.gridSize

    this.ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    this.ctx.lineWidth = 0.5
    this.ctx.beginPath()

    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * step
      this.ctx.moveTo(pos, 0)
      this.ctx.lineTo(pos, this.canvas.height)
      this.ctx.moveTo(0, pos)
      this.ctx.lineTo(this.canvas.width, pos)
    }
    this.ctx.stroke()
  }

  public toggleGrid() {
    this.showGrid = !this.showGrid
    this.requestRedraw()
  }

  public getPixelCoords(
    evt: MouseEvent | TouchEvent,
    changedTouches = false
  ): [number, number] | null {
    const rect = this.canvas.getBoundingClientRect()

    const clientX =
      evt instanceof MouseEvent
        ? evt.clientX
        : changedTouches
        ? evt.changedTouches[0].clientX
        : evt.touches[0].clientX
    const clientY =
      evt instanceof MouseEvent
        ? evt.clientY
        : changedTouches
        ? evt.changedTouches[0].clientY
        : evt.touches[0].clientY

    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    const x = Math.floor(((clientX - rect.left) * scaleX) / this.gridItemSize)
    const y = Math.floor(((clientY - rect.top) * scaleY) / this.gridItemSize)

    if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return null
    return [x, y]
  }

  public getCleanDataURL(): string {
    return this.offscreen.toDataURL('image/png')
  }
}

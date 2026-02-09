import { DEFAULT_MAX_COLORS } from '@/lib/grid-settings'
import { HistoryManager } from './history'
import { Color, PixelRenderer } from './renderer'
import { ToolManager, ToolName } from './tool'

export const DEFAULT_SIZE = 32
export const GRID_ITEM_SIZE = 12

export class PixelEditor {
  private pixelData: Uint8ClampedArray
  private renderer: PixelRenderer
  private previewRenderer: PixelRenderer
  private toolManager: ToolManager
  private tool: ToolName = 'pen'
  private color: Color = [0, 0, 0, 255]
  private history: HistoryManager
  private isDrawing = false
  private currentImageUrl: string | null = null

  private handlers = {
    mouseDown: (e: MouseEvent) => {
      this.isDrawing = true
      this.history.startAction()
      this.toolManager.currentTool.onDown(e, this.color)
      this.renderer.requestRedraw()
    },
    mouseMove: (e: MouseEvent) => {
      if (!this.isDrawing) return
      this.toolManager.currentTool.onMove(e, this.color)
      if (!this.toolManager.currentTool.atomic) this.renderer.requestRedraw()
    },
    mouseUp: (e: MouseEvent) => {
      if (!this.isDrawing) return
      this.isDrawing = false
      this.toolManager.currentTool.onUp(e, this.color)
      this.history.endAction()
      this.renderer.requestRedraw()
    },
    touchStart: (e: TouchEvent) => {
      if (e.target === this.canvas) {
        e.preventDefault()
      }
      this.isDrawing = true
      this.history.startAction()
      this.toolManager.currentTool.onDown(e, this.color)
      this.renderer.requestRedraw()
    },
    touchMove: (e: TouchEvent) => {
      if (e.target === this.canvas) {
        e.preventDefault()
      }
      if (!this.isDrawing) return
      this.toolManager.currentTool.onMove(e, this.color)
      if (!this.toolManager.currentTool.atomic) this.renderer.requestRedraw()
    },
    touchEnd: (e: TouchEvent) => {
      if (e.target === this.canvas) {
        e.preventDefault()
      }
      if (!this.isDrawing) return
      this.isDrawing = false
      this.toolManager.currentTool.onUp(e, this.color)
      this.history.endAction()
      this.renderer.requestRedraw()
    },
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private previewCanvas: HTMLCanvasElement,
    private gridSize: number = DEFAULT_SIZE,
    private onHistoryChange?: () => void
  ) {
    this.pixelData = new Uint8ClampedArray(this.gridSize * this.gridSize * 4)

    this.renderer = new PixelRenderer(canvas, this.gridSize)
    this.previewRenderer = new PixelRenderer(previewCanvas, this.gridSize)

    this.history = new HistoryManager(this.pixelData, this.onHistoryChange)

    this.toolManager = new ToolManager(
      this.renderer,
      this.pixelData,
      this.gridSize,
      this.previewRenderer
    )
    this.toolManager.setTool(this.tool)

    this.setupEvents()
    this.renderer.startRenderLoop()
    this.previewRenderer.startRenderLoop()
  }

  private setupEvents(): void {
    this.canvas.addEventListener('mousedown', this.handlers.mouseDown)
    this.canvas.addEventListener('mousemove', this.handlers.mouseMove)
    window.addEventListener('mouseup', this.handlers.mouseUp)
    this.canvas.addEventListener('touchstart', this.handlers.touchStart)
    this.canvas.addEventListener('touchmove', this.handlers.touchMove)
    window.addEventListener('touchend', this.handlers.touchEnd)
  }

  private cleanupEvents(): void {
    this.canvas.removeEventListener('mousedown', this.handlers.mouseDown)
    this.canvas.removeEventListener('mousemove', this.handlers.mouseMove)
    window.removeEventListener('mouseup', this.handlers.mouseUp)
    this.canvas.removeEventListener('touchstart', this.handlers.touchStart)
    this.canvas.removeEventListener('touchmove', this.handlers.touchMove)
    window.removeEventListener('touchend', this.handlers.touchEnd)
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.gridSize && y < this.gridSize
  }

  public convertToSvg() {
    const svgParts: string[] = []
    const cellSize = 1

    svgParts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.gridSize}" height="${this.gridSize}" shape-rendering="crispEdges">`
    )

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const i = (y * this.gridSize + x) * 4
        const r = this.pixelData[i]
        const g = this.pixelData[i + 1]
        const b = this.pixelData[i + 2]
        const a = this.pixelData[i + 3] / 255

        if (a > 0) {
          const fill = `rgba(${r},${g},${b},${a.toFixed(3)})`
          svgParts.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" />`
          )
        }
      }
    }

    svgParts.push(`</svg>`)
    return svgParts.join('')
  }

  public setPixel(x: number, y: number, color: Color): void {
    if (this.isWithinBounds(x, y)) {
      const i = (y * this.gridSize + x) * 4

      if (
        this.pixelData[i + 0] !== color[0] ||
        this.pixelData[i + 1] !== color[1] ||
        this.pixelData[i + 2] !== color[2] ||
        this.pixelData[i + 3] !== color[3]
      ) {
        this.pixelData[i + 0] = color[0]
        this.pixelData[i + 1] = color[1]
        this.pixelData[i + 2] = color[2]
        this.pixelData[i + 3] = color[3]
      }
    }
  }

  public clear(color: Color = [0, 0, 0, 0]): void {
    this.history.startAction()
    for (let i = 0; i < this.pixelData.length; i += 4) {
      this.pixelData[i + 0] = color[0]
      this.pixelData[i + 1] = color[1]
      this.pixelData[i + 2] = color[2]
      this.pixelData[i + 3] = color[3]
    }
    this.previewRenderer.clear()
    this.renderer.redraw(this.pixelData)
    this.history.endAction()
  }

  public setColor(color: Color): void {
    this.color = [...color]
  }

  public setTool(tool: ToolName): void {
    this.toolManager.setTool(tool)
  }

  public setToolSize(size: number): void {
    this.toolManager.setToolSize(size)
  }

  public undo(): void {
    const snapshot = this.history.undo()
    if (!snapshot) return
    this.pixelData.set(snapshot)
    this.renderer.redraw(this.pixelData)
  }

  public redo(): void {
    const snapshot = this.history.redo()
    if (!snapshot) return
    this.pixelData.set(snapshot)
    this.renderer.redraw(this.pixelData)
  }

  public canUndo(): boolean {
    return this.history.canUndo()
  }

  public canRedo(): boolean {
    return this.history.canRedo()
  }

  public toggleGrid(): void {
    this.renderer.toggleGrid()
  }

  public getGridSize(): number {
    return this.gridSize
  }

  /**
   * Resize the editor grid to a new size.
   * This recreates all internal data structures for the new size.
   */
  public resizeGrid(newSize: number): void {
    if (newSize === this.gridSize) return

    console.log(`[resizeGrid] Resizing from ${this.gridSize} to ${newSize}`)

    this.gridSize = newSize

    // Create new pixel data array
    this.pixelData = new Uint8ClampedArray(newSize * newSize * 4)

    // Update renderers
    this.renderer.setGridSize(newSize)
    this.previewRenderer.setGridSize(newSize)

    // Update tool manager with new grid size and pixel data
    this.toolManager.setGridSize(newSize, this.pixelData)

    // Reset history with new pixel data
    this.history = new HistoryManager(this.pixelData, this.onHistoryChange)

    // Update renderer's pixel data reference
    this.renderer.pixelData = this.pixelData

    console.log(`[resizeGrid] Resize complete`)
  }

  /**
   * Load an image into the editor.
   *
   * - SVGs (saved pixel art) are loaded directly — 1:1 pixel read.
   * - Raster images (PNGs from generation) are snapped to a pixel grid
   *   via spritefusion-pixel-snapper (WASM).
   *
   * By default the grid auto-sizes to match the image dimensions.
   * Pass `preserveGridSize: true` to keep the current grid size.
   */
  public async loadImage(
    imageUrl: string,
    options?: { preserveGridSize?: boolean }
  ): Promise<void> {
    this.currentImageUrl = imageUrl

    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Saved SVGs are 1:1 with the grid — load directly
    if (blob.type === 'image/svg+xml') {
      await this.loadSvg(imageUrl)
      return
    }

    const imageBytes = new Uint8Array(await blob.arrayBuffer())

    // Dynamic import keeps the WASM out of the initial bundle
    const { snapPixels } = await import('@/lib/pixel-snapper')
    const { imageData } = await snapPixels(imageBytes, DEFAULT_MAX_COLORS)

    const srcWidth = imageData.width
    const srcHeight = imageData.height

    // Determine target grid size
    let targetGridSize: number
    if (options?.preserveGridSize) {
      targetGridSize = this.gridSize
    } else {
      targetGridSize = Math.max(srcWidth, srcHeight)
      this.resizeGrid(targetGridSize)
    }

    // Clear and copy pixels, centering within the grid
    this.pixelData.fill(0)
    const offsetX = Math.floor((targetGridSize - srcWidth) / 2)
    const offsetY = Math.floor((targetGridSize - srcHeight) / 2)

    for (let y = 0; y < srcHeight; y++) {
      for (let x = 0; x < srcWidth; x++) {
        const srcIdx = (y * srcWidth + x) * 4
        const a = imageData.data[srcIdx + 3]
        if (a > 10) {
          this.setPixel(x + offsetX, y + offsetY, [
            imageData.data[srcIdx],
            imageData.data[srcIdx + 1],
            imageData.data[srcIdx + 2],
            a,
          ])
        }
      }
    }

    this.renderer.pixelData = this.pixelData
    this.renderer.startRenderLoop()
    this.history.startAction()
    this.history.endAction()
  }

  /**
   * Load a saved SVG directly into the pixel grid.
   *
   * Our SVGs are 1:1 with the grid (width/height = gridSize, one <rect>
   * per pixel cell), so we rasterize at native resolution and read pixels
   * directly — no quantization or cell analysis needed.
   */
  private async loadSvg(svgUrl: string): Promise<void> {
    this.currentImageUrl = svgUrl

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        this.pixelData.fill(0)
        this.renderer.clear()
        this.previewRenderer.clear()

        // Render at native SVG dimensions (= grid size)
        const w = img.naturalWidth || this.gridSize
        const h = img.naturalHeight || this.gridSize

        const canvas = new OffscreenCanvas(w, h)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)

        const { data } = ctx.getImageData(0, 0, w, h)

        for (let y = 0; y < h && y < this.gridSize; y++) {
          for (let x = 0; x < w && x < this.gridSize; x++) {
            const i = (y * w + x) * 4
            const a = data[i + 3]
            if (a > 0) {
              this.setPixel(x, y, [data[i], data[i + 1], data[i + 2], a])
            }
          }
        }

        this.renderer.pixelData = this.pixelData
        this.renderer.startRenderLoop()
        this.history.startAction()
        this.history.endAction()

        img.src = ''
        resolve()
      }

      img.onerror = () => reject(new Error('Failed to load SVG'))
      img.src = svgUrl
    })
  }

  public async download({
    fileName = 'my-pixel-icon',
    as,
  }: {
    fileName?: string
    as: 'svg' | 'png'
  }): Promise<void> {
    const link = document.createElement('a')
    link.download = `${fileName}.${as}`

    if (as === 'png') {
      link.href = this.renderer.getCleanDataURL()
      link.click()
    } else {
      const svgContent = this.convertToSvg()
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      link.href = url
      link.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
    }
  }

  public destroy(): void {
    this.cleanupEvents()
    this.renderer.destroy()
    this.previewRenderer.destroy()
  }

  public resetHistory(): void {
    return this.history.resetHistory()
  }

  public hasUnsavedChanges(): boolean {
    return this.canUndo()
  }

  /**
   * Extract all unique colors currently used in the pixel grid.
   * Returns an array of [r, g, b, a] color tuples sorted by frequency.
   */
  public getPalette(): Color[] {
    const colorMap = new Map<string, { color: Color; count: number }>()

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const idx = (y * this.gridSize + x) * 4
        const r = this.pixelData[idx]
        const g = this.pixelData[idx + 1]
        const b = this.pixelData[idx + 2]
        const a = this.pixelData[idx + 3]

        // Skip transparent pixels
        if (a < 10) continue

        const key = `${r},${g},${b},${a}`
        const existing = colorMap.get(key)
        if (existing) {
          existing.count++
        } else {
          colorMap.set(key, { color: [r, g, b, a], count: 1 })
        }
      }
    }

    // Sort by frequency (most used first) and return colors
    return Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.color)
  }

  /**
   * Reload the current image. Used after grid size changes.
   */
  public async reloadImage(): Promise<void> {
    if (!this.currentImageUrl) return
    await this.loadImage(this.currentImageUrl)
  }

  /**
   * Update the grid size and reload the image.
   */
  public async setGridSizeAndReload(newSize: number): Promise<void> {
    if (newSize === this.gridSize && this.currentImageUrl) {
      await this.reloadImage()
      return
    }

    this.resizeGrid(newSize)

    if (this.currentImageUrl) {
      await this.loadImage(this.currentImageUrl, {
        preserveGridSize: true,
      })
    }
  }
}

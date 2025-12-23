import {
  DEFAULT_GRID_SETTINGS,
  GridSettings,
} from '@/app/swr/use-pixel-version'
import { HistoryManager } from './history'
import { getQuantizer } from './quant'
import { Color, PixelRenderer } from './renderer'
import { ToolManager, ToolName } from './tool'
import { analyzeGridCell, findDominantColor } from './utils'

export type { GridSettings }

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
  private currentGridSettings: GridSettings = DEFAULT_GRID_SETTINGS

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
   * Load an image using unfake's processImage for pixel grid conversion.
   * This uses advanced scale detection and downscaling algorithms.
   * By default, dynamically resizes the grid to match unfake's output.
   * Set preserveGridSize to true to keep the current grid size (for user-initiated grid size changes).
   */
  public async loadImageWithUnfake(
    imageUrl: string,
    settings: GridSettings = DEFAULT_GRID_SETTINGS,
    options?: { preserveGridSize?: boolean }
  ): Promise<void> {
    console.log('[loadImageWithUnfake] Starting for:', imageUrl)
    console.log('[loadImageWithUnfake] Settings:', settings)

    // Store current image URL and settings for reloading
    this.currentImageUrl = imageUrl
    this.currentGridSettings = { ...DEFAULT_GRID_SETTINGS, ...settings }

    // Fetch the image as a blob
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // If SVG, use loadSVG2
    if (blob.type === 'image/svg+xml') {
      await this.loadSVG2(imageUrl, settings)
      return
    }

    const file = new File([blob], 'image.png', { type: blob.type })

    console.log(
      '[loadImageWithUnfake] Fetched image, size:',
      file.size,
      'bytes'
    )

    // Dynamic import to avoid bundling OpenCV at build time
    const { processImage } = await import('@/lib/unfake')

    console.log('[loadImageWithUnfake] Processing with unfake...')

    const mergedSettings = { ...DEFAULT_GRID_SETTINGS, ...settings }
    const result = await processImage({
      file,
      maxColors: mergedSettings.maxColors ?? 32,
      downscaleMethod: mergedSettings.downscaleMethod ?? 'dominant',
      cleanup: {
        morph: mergedSettings.cleanup?.morph ?? false,
        jaggy: mergedSettings.cleanup?.jaggy ?? true,
      },
      alphaThreshold: mergedSettings.alphaThreshold ?? 128,
      snapGrid: mergedSettings.snapGrid ?? true,
      maxGridSize: this.gridSize,
    })

    console.log('[loadImageWithUnfake] Processing complete!')
    console.log(
      '[loadImageWithUnfake] Result size:',
      result.imageData.width,
      'x',
      result.imageData.height
    )
    console.log('[loadImageWithUnfake] Palette colors:', result.palette.length)

    const { imageData } = result
    const srcWidth = imageData.width
    const srcHeight = imageData.height

    // Determine the target grid size
    let targetGridSize: number
    if (options?.preserveGridSize) {
      // User explicitly set grid size, keep it
      targetGridSize = this.gridSize
      console.log('[loadImageWithUnfake] Preserving grid size:', targetGridSize)
    } else {
      // Auto-size based on unfake output
      targetGridSize = Math.max(srcWidth, srcHeight)
      this.resizeGrid(targetGridSize)
      console.log('[loadImageWithUnfake] Grid resized to:', targetGridSize)
    }

    // Copy pixels directly from unfake output to editor grid
    // Center the image within the target grid
    const offsetX = Math.floor((targetGridSize - srcWidth) / 2)
    const offsetY = Math.floor((targetGridSize - srcHeight) / 2)

    for (let y = 0; y < srcHeight; y++) {
      for (let x = 0; x < srcWidth; x++) {
        const srcIdx = (y * srcWidth + x) * 4
        const r = imageData.data[srcIdx]
        const g = imageData.data[srcIdx + 1]
        const b = imageData.data[srcIdx + 2]
        const a = imageData.data[srcIdx + 3]

        // Only set pixels with visible alpha
        if (a > 10) {
          this.setPixel(x + offsetX, y + offsetY, [r, g, b, a])
        }
      }
    }

    this.renderer.pixelData = this.pixelData
    this.renderer.startRenderLoop()
    this.history.startAction()
    this.history.endAction()

    console.log('[loadImageWithUnfake] Grid mapping complete!')
  }

  public async loadSVG2(
    svgUrl: string,
    settings: GridSettings = DEFAULT_GRID_SETTINGS
  ): Promise<void> {
    // Store current image URL and settings for reloading
    this.currentImageUrl = svgUrl
    this.currentGridSettings = { ...DEFAULT_GRID_SETTINGS, ...settings }

    const mergedSettings = { ...DEFAULT_GRID_SETTINGS, ...settings }

    return new Promise((resolve, reject) => {
      const svgImage = new Image()
      svgImage.crossOrigin = 'anonymous'

      svgImage.onload = () => {
        this.pixelData.fill(0)
        this.renderer.clear()
        this.previewRenderer.clear()

        const resizeResolution = 792
        svgImage.width = resizeResolution
        svgImage.height = resizeResolution

        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = resizeResolution
        tempCanvas.height = resizeResolution

        const tempCtx = tempCanvas.getContext('2d', {
          willReadFrequently: true,
        })

        if (!tempCtx) {
          reject(new Error('Failed to get temporary canvas context'))
          return
        }

        tempCtx.drawImage(svgImage, 0, 0, resizeResolution, resizeResolution)

        const q = getQuantizer()
        q.sample(tempCanvas)
        const quantized = q.reduce(tempCanvas)

        const quantizedImageData = tempCtx.createImageData(
          resizeResolution,
          resizeResolution
        )
        quantizedImageData.data.set(quantized)
        tempCtx.putImageData(quantizedImageData, 0, 0)

        const svgPixelSize = resizeResolution / this.gridSize
        const alphaThreshold = mergedSettings.alphaThreshold ?? 200
        const fillThreshold = mergedSettings.fillThreshold ?? 61

        for (let x = 0; x < this.gridSize; x++) {
          for (let y = 0; y < this.gridSize; y++) {
            const { filledPixels, totalPixels, colorMap } = analyzeGridCell({
              width: resizeResolution,
              startX: x * svgPixelSize,
              startY: y * svgPixelSize,
              regionSize: svgPixelSize,
              alphaThreshold,
              quantizedData: quantized,
            })

            const filledPercentage = (filledPixels / totalPixels) * 100
            if (filledPercentage < fillThreshold) continue

            const dominantColor = findDominantColor(colorMap)

            if (dominantColor) {
              if (this.isWithinBounds(x, y)) {
                this.setPixel(x, y, dominantColor)
              }
            }
          }
        }

        this.renderer.pixelData = this.pixelData
        this.renderer.startRenderLoop()
        this.history.startAction()
        this.history.endAction()

        resolve()

        svgImage.src = ''
        tempCanvas.remove()
      }

      svgImage.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      svgImage.src = svgUrl
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
   * Get the current grid settings used for image processing.
   */
  public getGridSettings(): GridSettings {
    return { ...this.currentGridSettings }
  }

  /**
   * Reload the current image with new grid settings.
   * This will re-process the image from scratch.
   */
  public async reloadWithSettings(settings: GridSettings): Promise<void> {
    if (!this.currentImageUrl) {
      console.warn('[reloadWithSettings] No image URL stored, cannot reload')
      return
    }

    console.log('[reloadWithSettings] Reloading with settings:', settings)
    await this.loadImageWithUnfake(this.currentImageUrl, settings)
  }

  /**
   * Update the grid size and reload the image.
   * This is a convenience method that combines resizing with reloading.
   */
  public async setGridSizeAndReload(newSize: number): Promise<void> {
    if (newSize === this.gridSize && this.currentImageUrl) {
      // Just reload with current settings
      await this.reloadWithSettings(this.currentGridSettings)
      return
    }

    this.resizeGrid(newSize)

    if (this.currentImageUrl) {
      // Preserve the user's grid size choice - don't let unfake override it
      await this.loadImageWithUnfake(this.currentImageUrl, this.currentGridSettings, {
        preserveGridSize: true,
      })
    }
  }
}

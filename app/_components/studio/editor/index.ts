import { HistoryManager } from './history'
import { getQuantizer } from './quant'
import { Color, PixelRenderer } from './renderer'
import { ToolManager, ToolName } from './tool'
import { analyzeGridCell, findDominantColor } from './utils'

export const DEFAULT_SIZE = 36
export const GRID_ITEM_SIZE = 10

export class PixelEditor {
  private pixelData: Uint8ClampedArray
  private renderer: PixelRenderer
  private previewRenderer: PixelRenderer
  private toolManager: ToolManager
  private tool: ToolName = 'pen'
  private color: Color = [0, 0, 0, 255]
  private history: HistoryManager
  private isDrawing = false

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

  public async loadSVG2(svgUrl: string): Promise<void> {
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

        for (let x = 0; x < this.gridSize; x++) {
          for (let y = 0; y < this.gridSize; y++) {
            const { filledPixels, totalPixels, colorMap } = analyzeGridCell({
              width: resizeResolution,
              startX: x * svgPixelSize,
              startY: y * svgPixelSize,
              regionSize: svgPixelSize,
              alphaThreshold: 200,
              quantizedData: quantized,
            })

            const filledPercentage = (filledPixels / totalPixels) * 100
            if (filledPercentage < 61) continue

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
      link.href = this.canvas.toDataURL('image/png')
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
}

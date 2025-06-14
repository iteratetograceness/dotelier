import { Color, PixelRenderer } from './renderer'
import { line, Point } from './shapes'

export enum PixelEditorTool {
  Pen = 0,
  Eraser = 1,
  Fill = 2,
  Line = 3,
  Circle = 4,
}

interface ToolMeta {
  atomic: boolean
  showPreview: boolean
}

export const ToolMeta: Record<PixelEditorTool, ToolMeta> = {
  [PixelEditorTool.Pen]: { atomic: false, showPreview: false },
  [PixelEditorTool.Eraser]: { atomic: false, showPreview: false },
  [PixelEditorTool.Fill]: { atomic: true, showPreview: false },
  [PixelEditorTool.Line]: { atomic: true, showPreview: true },
  [PixelEditorTool.Circle]: { atomic: true, showPreview: false },
}

const MAX_TOOL_SIZE = 4

export class ToolManager {
  private tool: Tool
  private toolSize: number = 1

  constructor(
    private renderer: PixelRenderer,
    private pixelData: Uint8ClampedArray,
    private gridSize: number,
    private previewRenderer: PixelRenderer
  ) {
    this.tool = new PenTool(
      this.renderer,
      this.pixelData,
      this.gridSize,
      this.toolSize,
      this.previewRenderer
    )
  }

  public setTool(tool: ToolName) {
    const ToolClass = ToolRegistry[tool]
    if (tool === 'line') {
      this.tool = new ToolClass(
        this.renderer,
        this.pixelData,
        this.gridSize,
        this.toolSize,
        this.previewRenderer
      )
    } else {
      this.tool = new ToolClass(
        this.renderer,
        this.pixelData,
        this.gridSize,
        this.toolSize,
        this.previewRenderer
      )
    }
  }

  public setToolSize(size: number) {
    this.toolSize = Math.min(Math.max(size, 1), MAX_TOOL_SIZE)
    this.tool.updateToolSize(this.toolSize)
  }

  public get currentTool(): Tool {
    return this.tool
  }
}

interface Tool {
  onDown: (e: MouseEvent | TouchEvent, color: Color) => void
  onMove: (e: MouseEvent | TouchEvent, color: Color) => void
  onUp: (e: MouseEvent | TouchEvent, color: Color) => void
  showPreview: boolean
  atomic: boolean
  updateToolSize: (size: number) => void
}

abstract class BaseTool implements Tool {
  abstract showPreview: boolean
  abstract atomic: boolean

  constructor(
    protected renderer: PixelRenderer,
    protected pixelData: Uint8ClampedArray,
    protected gridSize: number,
    protected toolSize: number = 1,
    protected previewRenderer: PixelRenderer
  ) {}

  abstract onDown(e: MouseEvent | TouchEvent, color: Color): void
  abstract onMove(e: MouseEvent | TouchEvent, color: Color): void
  abstract onUp(e: MouseEvent | TouchEvent, color: Color): void

  protected setPixel(x: number, y: number, rgba: Color) {
    const size = Math.max(1, Math.min(this.toolSize || 1, MAX_TOOL_SIZE))

    if (size === 1) {
      if (this.isOutOfBounds(x, y)) return
      const i = (y * this.gridSize + x) * 4
      this.pixelData[i + 0] = rgba[0]
      this.pixelData[i + 1] = rgba[1]
      this.pixelData[i + 2] = rgba[2]
      this.pixelData[i + 3] = rgba[3]
      return
    }

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = x + dx
        const py = y + dy
        if (this.isOutOfBounds(px, py)) continue
        const i = (py * this.gridSize + px) * 4
        this.pixelData[i + 0] = rgba[0]
        this.pixelData[i + 1] = rgba[1]
        this.pixelData[i + 2] = rgba[2]
        this.pixelData[i + 3] = rgba[3]
      }
    }
  }

  protected setPixels(points: { x: number; y: number }[], rgba: Color) {
    for (const p of points) this.setPixel(p.x, p.y, rgba)
  }

  protected setPixelFromEvent(e: MouseEvent | TouchEvent, color: Color) {
    const coords = this.renderer.getPixelCoords(e)
    if (!coords) return
    const [x, y] = coords
    this.setPixel(x, y, color)
  }

  protected getPixel(x: number, y: number): Color | null {
    if (this.isOutOfBounds(x, y)) return null
    const i = (y * this.gridSize + x) * 4
    return [
      this.pixelData[i + 0],
      this.pixelData[i + 1],
      this.pixelData[i + 2],
      this.pixelData[i + 3],
    ]
  }

  protected isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize
  }

  public updateToolSize(size: number) {
    this.toolSize = size
  }
}

class PenTool extends BaseTool {
  showPreview = false
  atomic = false

  onDown(e: MouseEvent | TouchEvent, color: Color) {
    this.setPixelFromEvent(e, color)
  }

  onMove(e: MouseEvent | TouchEvent, color: Color) {
    this.setPixelFromEvent(e, color)
  }

  onUp() {}
}

export class EraserTool extends BaseTool {
  showPreview = false
  atomic = false

  onDown(e: MouseEvent | TouchEvent) {
    this.setPixelFromEvent(e, [0, 0, 0, 0])
  }

  onMove(e: MouseEvent | TouchEvent) {
    this.setPixelFromEvent(e, [0, 0, 0, 0])
  }

  onUp() {}
}

export class FillTool extends BaseTool {
  showPreview = false
  atomic = true

  onDown(e: MouseEvent | TouchEvent, color: Color) {
    const coords = this.renderer.getPixelCoords(e)
    if (!coords) return
    const [x, y] = coords

    const targetColor = this.getPixel(x, y)
    if (!targetColor) return
    if (this.colorsEqual(targetColor, color)) return

    this.floodFill(x, y, targetColor, color)
  }

  onMove() {}

  onUp() {}

  private floodFill(
    x: number,
    y: number,
    targetColor: Color,
    fillColor: Color
  ) {
    const queue: Array<{ x: number; y: number }> = [{ x, y }]

    while (queue.length) {
      const { x, y } = queue.shift()!
      if (this.isOutOfBounds(x, y)) continue

      const prevColor = this.getPixel(x, y)
      if (!prevColor) continue
      if (!this.colorsEqual(prevColor, targetColor)) continue

      // Always fill one pixel at a time for flood fill
      const i = (y * this.gridSize + x) * 4
      this.pixelData[i + 0] = fillColor[0]
      this.pixelData[i + 1] = fillColor[1]
      this.pixelData[i + 2] = fillColor[2]
      this.pixelData[i + 3] = fillColor[3]

      queue.push({ x: x + 1, y })
      queue.push({ x: x - 1, y })
      queue.push({ x, y: y + 1 })
      queue.push({ x, y: y - 1 })
    }
  }

  private colorsEqual(a: Color, b: Color): boolean {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
  }
}

abstract class BasePreviewTool extends BaseTool {
  protected startX = 0
  protected startY = 0
  protected isDrawing = false

  constructor(
    renderer: PixelRenderer,
    pixelData: Uint8ClampedArray,
    gridSize: number,
    toolSize: number,
    previewRenderer: PixelRenderer
  ) {
    super(renderer, pixelData, gridSize, toolSize, previewRenderer)
  }

  onDown(e: MouseEvent | TouchEvent) {
    const coords = this.renderer.getPixelCoords(e)
    if (!coords) return
    ;[this.startX, this.startY] = coords
    this.isDrawing = true
  }

  onMove(e: MouseEvent | TouchEvent, color: Color) {
    if (!this.isDrawing) return
    const coords = this.renderer.getPixelCoords(e)
    if (!coords) return
    this.previewRenderer.clear()
    this.drawPreview(coords[0], coords[1], color)
  }

  onUp(e: MouseEvent | TouchEvent, color: Color) {
    if (!this.isDrawing) return
    this.isDrawing = false
    this.previewRenderer.clear()
    const coords = this.renderer.getPixelCoords(e, true)
    if (!coords) return
    const [x, y] = coords
    this.commit(x, y, color)
  }

  protected abstract drawPreview(x: number, y: number, color: Color): void
  protected abstract commit(x: number, y: number, color: Color): void
}

class LineTool extends BasePreviewTool {
  showPreview = true
  atomic = true

  protected drawPreview(x: number, y: number, color: Color) {
    const start = new Point(this.startX, this.startY)
    const end = new Point(x, y)
    const points = line(start, end)
    const lighterColor: Color = [color[0], color[1], color[2], color[3] / 2]
    const size = Math.max(1, Math.min(this.toolSize || 1, MAX_TOOL_SIZE))
    const filteredPoints = points.filter((_, index) => index % size === 0)

    for (const point of filteredPoints) {
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const px = point.x + dx
          const py = point.y + dy
          if (this.isOutOfBounds(px, py)) continue
          this.previewRenderer.drawPixel(px, py, lighterColor)
        }
      }
    }
  }

  protected commit(x: number, y: number, color: Color) {
    const start = new Point(this.startX, this.startY)
    const end = new Point(x, y)
    const points = line(start, end)
    const size = Math.max(1, Math.min(this.toolSize || 1, MAX_TOOL_SIZE))
    const filteredPoints = points.filter((_, index) => index % size === 0)
    this.setPixels(filteredPoints, color)
  }
}

export const ToolRegistry = {
  pen: PenTool,
  line: LineTool,
  eraser: EraserTool,
  fill: FillTool,
} as const

export type ToolName = keyof typeof ToolRegistry

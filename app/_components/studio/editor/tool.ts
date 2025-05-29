import { Color, PixelRenderer } from './renderer'
import { line, Point } from './shapes'

export class ToolManager {
  private tool: Tool

  constructor(
    private renderer: PixelRenderer,
    private pixelData: Uint8ClampedArray,
    private gridSize: number,
    private previewRenderer: PixelRenderer
  ) {
    this.tool = new PenTool(this.renderer, this.pixelData, this.gridSize)
  }

  public setTool(tool: ToolName) {
    const ToolClass = ToolRegistry[tool]
    this.tool = new ToolClass(
      this.renderer,
      this.pixelData,
      this.gridSize,
      this.previewRenderer
    )
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
}

abstract class BaseTool implements Tool {
  abstract showPreview: boolean
  abstract atomic: boolean

  constructor(
    protected renderer: PixelRenderer,
    protected pixelData: Uint8ClampedArray,
    protected gridSize: number
  ) {}

  abstract onDown(e: MouseEvent | TouchEvent, color: Color): void
  abstract onMove(e: MouseEvent | TouchEvent, color: Color): void
  abstract onUp(e: MouseEvent | TouchEvent, color: Color): void

  protected setPixel(x: number, y: number, rgba: Color) {
    if (this.isOutOfBounds(x, y)) return
    const i = (y * this.gridSize + x) * 4
    this.pixelData[i + 0] = rgba[0]
    this.pixelData[i + 1] = rgba[1]
    this.pixelData[i + 2] = rgba[2]
    this.pixelData[i + 3] = rgba[3]
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

class EraserTool extends BaseTool {
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

class FillTool extends BaseTool {
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

       this.setPixel(x, y, fillColor)

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
    protected previewRenderer: PixelRenderer
  ) {
    super(renderer, pixelData, gridSize)
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
    const lighterColor = [color[0], color[1], color[2], color[3] / 2]
    this.previewRenderer.drawPixels(points, lighterColor as Color)
  }

  protected commit(x: number, y: number, color: Color) {
    const start = new Point(this.startX, this.startY)
    const end = new Point(x, y)
    const points = line(start, end)
    this.setPixels(points, color)
  }
}

const ToolRegistry = {
  pen: PenTool,
  line: LineTool,
  eraser: EraserTool,
  fill: FillTool,
} as const

export type ToolName = keyof typeof ToolRegistry

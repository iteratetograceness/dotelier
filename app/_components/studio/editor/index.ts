import { toast } from 'sonner'
import { circle, line, Point } from './shapes'

const WHITE: Color = [255, 255, 255, 1]

export type Color = [number, number, number, number]

export interface PixelEditorOptions {
  pixelWidth?: number
  pixelHeight?: number
  defaultColor?: Color
  colors?: Color[]
  onPixelDataChange?: (pixelData: Color[][]) => void
}

export enum PixelEditorTool {
  Pen = 0,
  Eraser = 1,
  Fill = 2,
  Line = 3,
  Circle = 4,
}

export const DEFAULT_WIDTH = 32
export const DEFAULT_HEIGHT = 32

export class PixelEditor {
  private canvas: HTMLCanvasElement
  private previewCanvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D
  private pixelWidth: number
  private pixelHeight: number
  private color: Color
  private tool: PixelEditorTool = PixelEditorTool.Pen
  private isDrawing: boolean = false
  private linePoints: Point[] = []
  private linePreviewPoint: Point | null = null
  private pixelData: Color[][]
  private pixelSizeX: number
  private pixelSizeY: number

  public eventsBinded: boolean = false

  private undoStack: Array<
    | { x: number; y: number; color: Color }
    | Array<{ x: number; y: number; color: Color }>
  > = []
  private redoStack: Array<
    | { x: number; y: number; color: Color }
    | Array<{ x: number; y: number; color: Color }>
  > = []

  private onPixelDataChange?: (pixelData: Color[][]) => void

  constructor(canvas: HTMLCanvasElement, options: PixelEditorOptions = {}) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')
    this.ctx = ctx

    this.pixelWidth = options.pixelWidth ?? DEFAULT_WIDTH
    this.pixelHeight = options.pixelHeight ?? DEFAULT_HEIGHT
    this.color = [...(options.defaultColor ?? [0, 0, 0, 1])]
    this.onPixelDataChange = options.onPixelDataChange

    this.pixelData = Array(this.pixelWidth)
      .fill(null)
      .map(() =>
        Array(this.pixelHeight)
          .fill(null)
          .map(() => [255, 255, 255, 1])
      )

    this.pixelSizeX = this.canvas.width / this.pixelWidth
    this.pixelSizeY = this.canvas.height / this.pixelHeight

    this.canvas.style.imageRendering = 'pixelated'

    this._clearCanvas()
    this._bindEvents()
    this.eventsBinded = true
  }

  private _bindEvents(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this._handleMouseUp.bind(this))

    // Touch events
    this.canvas.addEventListener(
      'touchstart',
      this._handleTouchStart.bind(this)
    )
    this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this))
    this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this))
  }

  private _handleMouseDown(e: MouseEvent): void {
    this.isDrawing = true
    const { x, y } = this._getPixelCoords(e)
    this._handleToolAction(x, y)
  }

  private _handleMouseMove(e: MouseEvent): void {
    if (this.tool === PixelEditorTool.Line && this.linePreviewPoint) {
      const rect = this.canvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / this.pixelSizeX)
      const y = Math.floor((e.clientY - rect.top) / this.pixelSizeY)

      this._handleLinePreview(x, y)
    } else {
      if (!this.isDrawing) return

      const { x, y } = this._getPixelCoords(e)

      // Only handle continuous drawing for pen and eraser
      if (this.tool === 0 || this.tool === 1) {
        this._handleToolAction(x, y)
      }
    }
  }

  private _initPreviewCanvas(): void {
    if (!this.previewCanvas) {
      this.previewCanvas = document.createElement('canvas')
      this.previewCanvas.width = this.canvas.width
      this.previewCanvas.height = this.canvas.height
      this.previewCanvas.style.position = 'absolute'
      this.previewCanvas.style.pointerEvents = 'none'
      this.canvas.parentElement?.appendChild(this.previewCanvas)
    }
  }

  private _clearLinePreview(): void {
    const previewCtx = this.previewCanvas?.getContext('2d')
    if (!previewCtx) return
    previewCtx.clearRect(
      0,
      0,
      this.previewCanvas?.width ?? this.canvas.width,
      this.previewCanvas?.height ?? this.canvas.height
    )
  }

  private _drawLinePreview(points: Point[]): void {
    this._initPreviewCanvas()

    const previewCtx = this.previewCanvas?.getContext('2d')
    if (!previewCtx) return

    previewCtx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.5)`

    for (const point of points) {
      if (
        point.x >= 0 &&
        point.x < this.pixelWidth &&
        point.y >= 0 &&
        point.y < this.pixelHeight
      ) {
        previewCtx.fillRect(
          Math.floor(point.x * this.pixelSizeX),
          Math.floor(point.y * this.pixelSizeY),
          Math.ceil(this.pixelSizeX),
          Math.ceil(this.pixelSizeY)
        )
      }
    }
  }

  private _handleLinePreview(x: number, y: number): void {
    if (x >= 0 && x < this.pixelWidth && y >= 0 && y < this.pixelHeight) {
      this._clearLinePreview()
      const previewPoints = line(this.linePoints[0], new Point(x, y))
      this._drawLinePreview(previewPoints)
    }
  }

  private _handleMouseUp(): void {
    this.isDrawing = false
  }

  private _handleTouchStart(e: TouchEvent): void {
    e.preventDefault()
    this.isDrawing = true
    const { x, y } = this._getTouchPixelCoords(e)
    this._handleToolAction(x, y)
  }

  private _handleTouchMove(e: TouchEvent): void {
    e.preventDefault()

    if (this.tool === PixelEditorTool.Line && this.linePreviewPoint) {
      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = Math.floor((touch.clientX - rect.left) / this.pixelSizeX)
      const y = Math.floor((touch.clientY - rect.top) / this.pixelSizeY)

      this._handleLinePreview(x, y)
    }

    if (!this.isDrawing) return

    const { x, y } = this._getTouchPixelCoords(e)

    // Only handle continuous drawing for pen and eraser
    if (this.tool === 0 || this.tool === 1) {
      this._handleToolAction(x, y)
    }
  }

  private _handleTouchEnd(e: TouchEvent): void {
    e.preventDefault()
    this.isDrawing = false
  }

  private _getPixelCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    const x = Math.floor(
      ((e.clientX - rect.left) / this.canvas.clientWidth) * this.pixelWidth
    )
    const y = Math.floor(
      ((e.clientY - rect.top) / this.canvas.clientHeight) * this.pixelHeight
    )
    return { x, y }
  }

  private _getTouchPixelCoords(e: TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = Math.floor(
      ((touch.clientX - rect.left) / this.canvas.clientWidth) * this.pixelWidth
    )
    const y = Math.floor(
      ((touch.clientY - rect.top) / this.canvas.clientHeight) * this.pixelHeight
    )
    return { x, y }
  }

  private _handleToolAction(x: number, y: number): void {
    switch (this.tool) {
      case PixelEditorTool.Pen:
        this._drawPixel(x, y)
        break
      case PixelEditorTool.Eraser:
        this._erasePixel(x, y)
        break
      case PixelEditorTool.Fill:
        this._fillBucket(x, y)
        break
      case PixelEditorTool.Line:
        this._handleLineToolClick(x, y)
        break
      case PixelEditorTool.Circle:
        this._handleCircleToolClick(x, y)
        break
      default:
        break
    }
  }

  private _drawPixel(x: number, y: number): void {
    if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) return

    if (JSON.stringify(this.pixelData[x][y]) !== JSON.stringify(this.color)) {
      this.undoStack.push({ x, y, color: [...this.pixelData[x][y]] })
      this.redoStack = []

      this.pixelData[x][y] = [...this.color]

      this.ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.color[3]})`
      this.ctx.fillRect(
        Math.floor(x * this.pixelSizeX),
        Math.floor(y * this.pixelSizeY),
        Math.ceil(this.pixelSizeX),
        Math.ceil(this.pixelSizeY)
      )

      this._notifyPixelDataChange()
    }
  }

  private _erasePixel(x: number, y: number): void {
    if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) return

    this.undoStack.push({ x, y, color: [...this.pixelData[x][y]] })
    this.redoStack = []

    this.pixelData[x][y] = [255, 255, 255, 1]

    this.ctx.fillStyle = `rgba(${WHITE[0]}, ${WHITE[1]}, ${WHITE[2]}, ${WHITE[3]})`
    this.ctx.fillRect(
      Math.floor(x * this.pixelSizeX),
      Math.floor(y * this.pixelSizeY),
      Math.ceil(this.pixelSizeX),
      Math.ceil(this.pixelSizeY)
    )

    this._notifyPixelDataChange()
  }

  private _fillBucket(x: number, y: number): void {
    if (x < 0 || x >= this.pixelWidth || y < 0 || y >= this.pixelHeight) return

    const targetColor = [...this.pixelData[x][y]]

    if (JSON.stringify(targetColor) === JSON.stringify(this.color)) return

    const changes: Array<{
      x: number
      y: number
      color: Color
    }> = []
    const visited = Array(this.pixelWidth)
      .fill(null)
      .map(() => Array(this.pixelHeight).fill(false))

    const fill = (fillX: number, fillY: number) => {
      if (
        fillX < 0 ||
        fillX >= this.pixelWidth ||
        fillY < 0 ||
        fillY >= this.pixelHeight ||
        visited[fillX][fillY] ||
        JSON.stringify(this.pixelData[fillX][fillY]) !==
          JSON.stringify(targetColor)
      ) {
        return
      }

      visited[fillX][fillY] = true

      changes.push({
        x: fillX,
        y: fillY,
        color: [...this.pixelData[fillX][fillY]],
      })

      this.pixelData[fillX][fillY] = [...this.color]

      this.ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.color[3]})`
      this.ctx.fillRect(
        Math.floor(fillX * this.pixelSizeX),
        Math.floor(fillY * this.pixelSizeY),
        Math.ceil(this.pixelSizeX),
        Math.ceil(this.pixelSizeY)
      )

      fill(fillX + 1, fillY)
      fill(fillX - 1, fillY)
      fill(fillX, fillY + 1)
      fill(fillX, fillY - 1)
    }

    fill(x, y)

    if (changes.length > 0) {
      this.undoStack.push(changes)
      this.redoStack = []
      this._notifyPixelDataChange()
    }
  }

  private _handleLineToolClick(x: number, y: number): void {
    const currentPoint = new Point(x, y)

    if (this.linePoints.length === 0) {
      this.linePoints.push(currentPoint)
      this.linePreviewPoint = currentPoint
    } else {
      const points = line(this.linePoints[0], currentPoint)
      const changes: Array<{
        x: number
        y: number
        color: Color
      }> = []

      for (const point of points) {
        if (
          point.x >= 0 &&
          point.x < this.pixelWidth &&
          point.y >= 0 &&
          point.y < this.pixelHeight
        ) {
          changes.push({
            x: point.x,
            y: point.y,
            color: [...this.pixelData[point.x][point.y]],
          })
          this._drawPixel(point.x, point.y)
        }
      }

      if (changes.length > 0) {
        this.undoStack = this.undoStack.slice(
          0,
          this.undoStack.length - changes.length
        )
        this.undoStack.push(changes)
        this.redoStack = []
        this._notifyPixelDataChange()
      }

      this.linePoints = []
      this.linePreviewPoint = null
    }
  }

  private _handleCircleToolClick(
    x: number,
    y: number,
    radius: number = 2
  ): void {
    const points = circle(radius, new Point(x, y))

    const changes: Array<{
      x: number
      y: number
      color: Color
    }> = []

    for (const point of points) {
      if (
        point.x >= 0 &&
        point.x < this.pixelWidth &&
        point.y >= 0 &&
        point.y < this.pixelHeight
      ) {
        changes.push({
          x: point.x,
          y: point.y,
          color: [...this.pixelData[point.x][point.y]],
        })
        this._drawPixel(point.x, point.y)
      }
    }

    if (changes.length > 0) {
      this.undoStack = this.undoStack.slice(
        0,
        this.undoStack.length - changes.length
      )
      this.undoStack.push(changes)
      this.redoStack = []
      this._notifyPixelDataChange()
    }
  }

  private _notifyPixelDataChange(): void {
    if (this.onPixelDataChange) {
      const dataCopy = this.pixelData.map((row) =>
        row.map((pixel) => [...pixel])
      ) as Color[][]
      this.onPixelDataChange(dataCopy)
    }
  }

  public undo(): void {
    if (this.undoStack.length === 0) return

    const lastAction = this.undoStack.pop()

    if (!lastAction) {
      toast.error('Failed to undo')
      return
    }

    if (Array.isArray(lastAction)) {
      const redoChanges: Array<{
        x: number
        y: number
        color: Color
      }> = []

      for (const change of lastAction) {
        const { x, y, color } = change

        redoChanges.push({
          x,
          y,
          color: [...this.pixelData[x][y]],
        })

        this.pixelData[x][y] = [...color]

        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
        console.log(`rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`)
        this.ctx.fillRect(
          Math.floor(x * this.pixelSizeX),
          Math.floor(y * this.pixelSizeY),
          Math.ceil(this.pixelSizeX),
          Math.ceil(this.pixelSizeY)
        )
      }

      this.redoStack.push(redoChanges)
    } else {
      const { x, y, color } = lastAction

      const redoChange = {
        x,
        y,
        color: [...this.pixelData[x][y]] as Color,
      }

      this.pixelData[x][y] = [...color]

      this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
      this.ctx.fillRect(
        Math.floor(x * this.pixelSizeX),
        Math.floor(y * this.pixelSizeY),
        Math.ceil(this.pixelSizeX),
        Math.ceil(this.pixelSizeY)
      )

      this.redoStack.push(redoChange)
    }

    this._notifyPixelDataChange()
  }

  public redo(): void {
    if (this.redoStack.length === 0) return

    const lastRedoAction = this.redoStack.pop()

    if (!lastRedoAction) {
      toast.error('Failed to redo')
      return
    }

    if (Array.isArray(lastRedoAction)) {
      const undoChanges: Array<{
        x: number
        y: number
        color: Color
      }> = []

      for (const change of lastRedoAction) {
        const { x, y, color } = change

        undoChanges.push({
          x,
          y,
          color: [...this.pixelData[x][y]],
        })

        this.pixelData[x][y] = [...color]

        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
        this.ctx.fillRect(
          Math.floor(x * this.pixelSizeX),
          Math.floor(y * this.pixelSizeY),
          Math.ceil(this.pixelSizeX),
          Math.ceil(this.pixelSizeY)
        )
      }

      this.undoStack.push(undoChanges)
    } else {
      const { x, y, color } = lastRedoAction

      const undoChange = {
        x,
        y,
        color: [...this.pixelData[x][y]] as Color,
      }

      this.pixelData[x][y] = [...color]

      this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
      this.ctx.fillRect(
        Math.floor(x * this.pixelSizeX),
        Math.floor(y * this.pixelSizeY),
        Math.ceil(this.pixelSizeX),
        Math.ceil(this.pixelSizeY)
      )

      this.undoStack.push(undoChange)
    }

    this._notifyPixelDataChange()
  }

  private _clearCanvas(): void {
    this.ctx.fillStyle = `rgba(${WHITE[0]}, ${WHITE[1]}, ${WHITE[2]}, ${WHITE[3]})`
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.pixelData = Array(this.pixelWidth)
      .fill(null)
      .map(() =>
        Array(this.pixelHeight)
          .fill(null)
          .map(() => [...WHITE])
      )
  }

  private _isWhite(color: Color): boolean {
    return (
      color[0] === WHITE[0] &&
      color[1] === WHITE[1] &&
      color[2] === WHITE[2] &&
      color[3] === WHITE[3]
    )
  }

  public clear(): void {
    if (this.tool === PixelEditorTool.Line) {
      this._clearLinePreview()
    }

    const changes: Array<{
      x: number
      y: number
      color: Color
    }> = []

    for (let x = 0; x < this.pixelWidth; x++) {
      for (let y = 0; y < this.pixelHeight; y++) {
        const currentColor = this.pixelData[x][y]
        if (!this._isWhite(currentColor)) {
          changes.push({
            x,
            y,
            color: [...currentColor],
          })
        }
      }
    }

    if (changes.length > 0) {
      this.undoStack.push(changes)
      this.redoStack = []
    }

    this._clearCanvas()
    this._notifyPixelDataChange()
  }

  public setColor(color: Color): void {
    this.color = [...color]
  }

  public setTool(toolIndex: PixelEditorTool): void {
    this.tool = toolIndex
  }

  public async loadSVG(svgUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const svgImage = new Image()
      svgImage.crossOrigin = 'anonymous'

      svgImage.onload = () => {
        this._clearCanvas()

        const tempCanvas = document.createElement('canvas')

        const svgPixelSize = svgImage.width / 32
        tempCanvas.width = svgImage.width
        tempCanvas.height = svgImage.height

        const tempCtx = tempCanvas.getContext('2d', {
          willReadFrequently: true,
        })

        if (!tempCtx) {
          reject(new Error('Failed to get temporary canvas context'))
          return
        }

        tempCtx.drawImage(svgImage, 0, 0)

        for (let x = 0; x < 32; x++) {
          for (let y = 0; y < 32; y++) {
            const sourceX = Math.floor(x * svgPixelSize + svgPixelSize / 2)
            const sourceY = Math.floor(y * svgPixelSize + svgPixelSize / 2)

            const pixelData = tempCtx.getImageData(sourceX, sourceY, 1, 1).data

            if (pixelData[3] > 10) {
              const color: Color = [
                pixelData[0],
                pixelData[1],
                pixelData[2],
                pixelData[3],
              ]

              // Center the 32x32 icon in our canvas
              const targetX = Math.floor((this.pixelWidth - 32) / 2) + x
              const targetY = Math.floor((this.pixelHeight - 32) / 2) + y

              if (
                targetX >= 0 &&
                targetX < this.pixelWidth &&
                targetY >= 0 &&
                targetY < this.pixelHeight
              ) {
                this.pixelData[targetX][targetY] = color

                this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
                this.ctx.fillRect(
                  Math.floor(targetX * this.pixelSizeX),
                  Math.floor(targetY * this.pixelSizeY),
                  Math.ceil(this.pixelSizeX),
                  Math.ceil(this.pixelSizeY)
                )
              }
            }
          }
        }

        this.undoStack = []
        this.redoStack = []

        this._notifyPixelDataChange()

        resolve()
      }

      svgImage.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      svgImage.src = svgUrl
    })
  }

  public exportSVG(): string {
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')

    svg.setAttribute('width', this.pixelWidth.toString())
    svg.setAttribute('height', this.pixelHeight.toString())
    svg.setAttribute('viewBox', `0 0 ${this.pixelWidth} ${this.pixelHeight}`)
    svg.setAttribute('xmlns', svgNS)

    for (let x = 0; x < this.pixelWidth; x++) {
      for (let y = 0; y < this.pixelHeight; y++) {
        const color = this.pixelData[x][y]

        if (color[0] === 255 && color[1] === 255 && color[2] === 255) {
          continue
        }

        const rect = document.createElementNS(svgNS, 'rect')
        rect.setAttribute('x', x.toString())
        rect.setAttribute('y', y.toString())
        rect.setAttribute('width', '1')
        rect.setAttribute('height', '1')
        rect.setAttribute(
          'fill',
          `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`
        )

        svg.appendChild(rect)
      }
    }

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svg)
  }

  public getPixelData(): Color[][] {
    return this.pixelData
  }

  // public resize(width: number, height: number): void {
  //   this.pixelWidth = width
  //   this.pixelHeight = height

  //   this.pixelSizeX = this.canvas.width / this.pixelWidth
  //   this.pixelSizeY = this.canvas.height / this.pixelHeight

  //   const newPixelData: Color[][] = Array(this.pixelWidth)
  //     .fill(null)
  //     .map(() =>
  //       Array(this.pixelHeight)
  //         .fill(null)
  //         .map(() => [255, 255, 255, 1] as Color)
  //     )

  //   for (let x = 0; x < Math.min(this.pixelWidth, this.pixelData.length); x++) {
  //     for (
  //       let y = 0;
  //       y < Math.min(this.pixelHeight, this.pixelData[0].length);
  //       y++
  //     ) {
  //       newPixelData[x][y] = [...this.pixelData[x][y]] as Color
  //     }
  //   }

  //   this.pixelData = newPixelData

  //   this._clearCanvas()
  //   this.redrawCanvas()

  //   this.undoStack = []
  //   this.redoStack = []

  //   this._notifyPixelDataChange()
  // }

  public redrawCanvas(): void {
    for (let x = 0; x < this.pixelWidth; x++) {
      for (let y = 0; y < this.pixelHeight; y++) {
        const color = this.pixelData[x][y]
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
        this.ctx.fillRect(
          Math.floor(x * this.pixelSizeX),
          Math.floor(y * this.pixelSizeY),
          Math.ceil(this.pixelSizeX),
          Math.ceil(this.pixelSizeY)
        )
      }
    }
  }

  public destroy(): void {
    this.eventsBinded = false
    this.canvas.removeEventListener(
      'mousedown',
      this._handleMouseDown.bind(this)
    )
    this.canvas.removeEventListener(
      'mousemove',
      this._handleMouseMove.bind(this)
    )
    this.canvas.removeEventListener('mouseup', this._handleMouseUp.bind(this))
    this.canvas.removeEventListener(
      'mouseleave',
      this._handleMouseUp.bind(this)
    )

    this.canvas.removeEventListener(
      'touchstart',
      this._handleTouchStart.bind(this)
    )
    this.canvas.removeEventListener(
      'touchmove',
      this._handleTouchMove.bind(this)
    )
    this.canvas.removeEventListener('touchend', this._handleTouchEnd.bind(this))
    this.previewCanvas?.remove()
    this.previewCanvas = null
  }
}

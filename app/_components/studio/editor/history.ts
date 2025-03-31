import { Color } from './renderer'

export interface PixelChange {
  x: number
  y: number
  prevColor: Color
  newColor: Color
}

export class HistoryManager {
  private stack: Uint8ClampedArray[] = []
  private index: number = -1
  private tempSnapshot?: Uint8ClampedArray

  constructor(private pixelData: Uint8ClampedArray) {}

  startAction() {
    this.stack = this.stack.slice(0, this.index + 1)
    this.tempSnapshot = new Uint8ClampedArray(this.pixelData)
  }

  endAction() {
    if (!this.tempSnapshot) return

    this.stack.push(new Uint8ClampedArray(this.pixelData))
    this.index++

    this.tempSnapshot = undefined
  }

  undo() {
    if (!this.canUndo()) return
    this.index--
    this.pixelData.set(this.stack[this.index])
    return this.stack[this.index]
  }

  redo() {
    if (!this.canRedo()) return
    this.index++
    this.pixelData.set(this.stack[this.index])
    return this.stack[this.index]
  }

  canUndo() {
    return this.index > 0
  }

  canRedo() {
    return this.index < this.stack.length - 1
  }
}

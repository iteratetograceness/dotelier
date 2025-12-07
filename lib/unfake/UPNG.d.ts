declare const UPNG: {
  decode: (buff: ArrayBuffer) => {
    width: number
    height: number
    depth: number
    ctype: number
    tabs: Record<string, unknown>
    frames: Array<{
      rect: { x: number; y: number; width: number; height: number }
      delay: number
      dispose: number
      blend: number
    }>
    data: Uint8Array
  }
  toRGBA8: (img: ReturnType<typeof UPNG.decode>) => ArrayBuffer[]
  encode: (
    imgs: ArrayBuffer[],
    w: number,
    h: number,
    cnum: number,
    dels?: number[],
    forbidPlte?: boolean
  ) => ArrayBuffer
  encodeLL: (
    imgs: ArrayBuffer[],
    w: number,
    h: number,
    cc: number,
    ac: number,
    depth: number,
    dels?: number[],
    tabs?: Record<string, unknown>,
    forbidPlte?: boolean
  ) => ArrayBuffer
  quantize: (
    data: Uint8Array,
    psize: number,
    K: number
  ) => { abuf: ArrayBuffer; inds: Uint8Array; plte: number[][] }
}

export default UPNG

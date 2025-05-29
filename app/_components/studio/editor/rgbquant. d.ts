declare module 'rgbquant' {
  interface RgbQuantOptions {
    colors?: number // desired palette size
    method?: 1 | 2 // histogram method
    boxSize?: [number, number] // subregion dims
    boxPxls?: number // min-population threshold
    initColors?: number // # of top-occurring colors
    minHueCols?: number // # of colors per hue group
    dithKern?: string | null // dithering kernel name
    dithDelta?: number // dithering threshold (0-1)
    dithSerp?: boolean // serpentine pattern dithering
    palette?: number[][] // predefined palette [[r,g,b],...]
    reIndex?: boolean // compact sparse palette
    useCache?: boolean // enable caching
    cacheFreq?: number // min color occurrence for cache
    colorDist?: 'euclidean' | 'manhattan' // color distance method
  }

  export default class RgbQuant {
    constructor(options?: RgbQuantOptions)
    sample(canvas: HTMLCanvasElement): void
    palette(tuples?: boolean): number[] | number[][]
    reduce(
      img: HTMLCanvasElement,
      retType?: 1 | 2,
      dithKern?: string | null,
      dithSerp?: boolean
    ): Uint8Array | number[]
  }
}

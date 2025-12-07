declare module 'imagetracerjs' {
  export interface TracerColor {
    r: number
    g: number
    b: number
    a: number
  }

  export interface TracerOptions {
    // Tracing
    corsenabled?: boolean
    ltres?: number
    qtres?: number
    pathomit?: number
    rightangleenhance?: boolean

    // Color quantization
    colorsampling?: 0 | 1 | 2
    numberofcolors?: number
    mincolorratio?: number
    colorquantcycles?: number
    pal?: TracerColor[]

    // SVG rendering
    strokewidth?: number
    linefilter?: boolean
    scale?: number
    roundcoords?: number
    viewbox?: boolean
    desc?: boolean
    lcpr?: number
    qcpr?: number

    // Blur
    blurradius?: number
    blurdelta?: number

    // Layering method
    layering?: 0 | 1

    // Visualization
    layercontainerid?: string
  }

  interface ImageTracer {
    imagedataToSVG(imgd: ImageData, options?: TracerOptions | string): string
    imageToSVG(
      url: string,
      callback: (svg: string) => void,
      options?: TracerOptions | string
    ): void
    imagedataToTracedata(
      imgd: ImageData,
      options?: TracerOptions | string
    ): object
    appendSVGString(svgstr: string, parentid: string): void
  }

  const imageTracer: ImageTracer
  export default imageTracer
}

import RgbQuant from 'rgbquant'

export const getQuantizer = () => {
  return new RgbQuant({
    colors: 9,
    method: 2,
    boxSize: [64, 64],
    boxPxls: 1,
    initColors: 8,
    minHueCols: 0,
    dithKern: null,
    dithDelta: 0.25,
    dithSerp: false,
    palette: [],
    reIndex: true,
    useCache: false,
    cacheFreq: 10,
    colorDist: 'euclidean',
  })
}

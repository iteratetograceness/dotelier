'server-only'

import sharp from 'sharp'

const PADDING = 60
const SIZE = 500

export async function postProcessCrop(imageBuffer: Buffer) {
  try {
    return sharp(imageBuffer)
      .trim({ lineArt: true })
      .extend({
        top: PADDING,
        bottom: PADDING,
        left: PADDING,
        right: PADDING,
        background: { r: 255, g: 255, b: 255 },
      })
      .toBuffer()
  } catch (error) {
    console.error('[postProcessCrop]: ', error)
    return imageBuffer
  }
}

export async function postProcessResize(imageBuffer: Buffer) {
  return sharp(imageBuffer)
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 },
    })
    .toBuffer()
}

export async function postProcessPixelate(imageBuffer: Buffer) {
  // 1. Crop
  const croppedBuffer = await postProcessCrop(imageBuffer)

  // 2. Resize
  const resizedBuffer = await postProcessResize(croppedBuffer)

  // 3. Return the resized buffer
  return resizedBuffer
}

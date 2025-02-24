'use server'

import { experimental_generateImage as generateImage } from 'ai'
import { pixelProvider } from './provider'
import { ApiStyle } from './constants'

export async function generatePixelIcon({
  prompt,
  style = 'color_v2',
}: {
  prompt: string
  style?: ApiStyle
}) {
  const model = pixelProvider.image(style)
  return generateImage({
    model,
    prompt,
  })
}

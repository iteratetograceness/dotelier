import { createModalWebEndpoint } from '@graceyun/modal-ai-sdk-provider'
import { experimental_generateImage as generateImage } from 'ai'

export const pixelProvider = createModalWebEndpoint({
  baseURL: 'https://iteratetograceness--pixel-api.modal.run',
  apiToken: 'L0txMIVmtshgT/sM6+/Wnyp/8N2YNFg9QOFHtYBXRhE=',
})

export async function generate() {
  const model = pixelProvider.image('color_v2')
  const { image } = await generateImage({
    model,
    prompt: 'Google G logo',
  })

  return image
}

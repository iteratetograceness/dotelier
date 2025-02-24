'server-only'

import { createModalWebEndpoint } from '@graceyun/modal-ai-sdk-provider'

export const pixelProvider = createModalWebEndpoint({
  baseURL: 'https://iteratetograceness--pixel-api.modal.run',
})

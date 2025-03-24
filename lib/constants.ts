import { getBaseUrl } from './base-url'

export const PIXELATE_API = getBaseUrl('/api/pixelate')
export const VECTORIZE_API = getBaseUrl('/api/vectorize')

export enum PostProcessingStatus {
  INITIATED = 'initiated',
  BACKGROUND_REMOVAL = 'background_removal',
  BACKGROUND_REMOVAL_FAILED = 'background_removal_failed',
  CONVERT_TO_SVG = 'convert_to_svg',
  CONVERT_TO_SVG_FAILED = 'convert_to_svg_failed',
  COMPLETED = 'completed',
}

export const FREE_CREDITS = 1

export const PIXEL_BORDER =
  '[clip-path:polygon(0_calc(100%-4px),2px_calc(100%-4px),2px_calc(100%-2px),4px_calc(100%-2px),4px_100%,calc(100%-4px)_100%,calc(100%-4px)_calc(100%-2px),calc(100%-2px)_calc(100%-2px),calc(100%-2px)_calc(100%-4px),100%_calc(100%-4px),100%_4px,calc(100%-2px)_4px,calc(100%-2px)_2px,calc(100%-4px)_2px,calc(100%-4px)_0,4px_0,4px_2px,2px_2px,2px_4px,0_4px)]'

// Dev
// export const PIXEL_API_URL =
//   'https://iteratetograceness--generate-dev.modal.run'
// export const WARM_PIXEL_API_URL = 'https://iteratetograceness--warmup-dev.modal.run'
// Prod
export const PIXEL_API_URL = 'https://iteratetograceness--generate.modal.run'
export const WARM_PIXEL_API_URL = 'https://iteratetograceness--warmup.modal.run'

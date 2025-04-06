export enum PostProcessingStatus {
  INITIATED = 'initiated',
  BACKGROUND_REMOVAL = 'background_removal',
  BACKGROUND_REMOVAL_FAILED = 'background_removal_failed',
  CONVERT_TO_SVG = 'convert_to_svg',
  CONVERT_TO_SVG_FAILED = 'convert_to_svg_failed',
  COMPLETED = 'completed',
}

export const FREE_CREDITS = 1

// Dev:
// export const PIXEL_API_URL =
//   'https://iteratetograceness--generate-dev.modal.run'
// export const WARM_PIXEL_API_URL = 'https://iteratetograceness--warmup-dev.modal.run'

// Prod
export const PIXEL_API_URL = 'https://iteratetograceness--generate.modal.run'
export const WARM_PIXEL_API_URL = 'https://iteratetograceness--warmup.modal.run'

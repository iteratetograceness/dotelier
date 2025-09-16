export enum PostProcessingStatus {
  INITIATED = 'initiated',
  BACKGROUND_REMOVAL = 'background_removal',
  BACKGROUND_REMOVAL_FAILED = 'background_removal_failed',
  CONVERT_TO_SVG = 'convert_to_svg',
  CONVERT_TO_SVG_FAILED = 'convert_to_svg_failed',
  COMPLETED = 'completed',
}

export const FREE_CREDITS = 3

export const NAV_LINKS = [
  { href: '/', label: 'Home', isActive: true },
  { href: '/explore', label: 'Explore' },
  { href: '/studio', label: 'Studio' },
] as const

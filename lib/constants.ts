export enum PostProcessingStatus {
  INITIATED = 'initiated',
  BACKGROUND_REMOVAL = 'background_removal',
  BACKGROUND_REMOVAL_FAILED = 'background_removal_failed',
  CONVERT_TO_SVG = 'convert_to_svg',
  CONVERT_TO_SVG_FAILED = 'convert_to_svg_failed',
  COMPLETED = 'completed',
}

export const FREE_CREDITS = 3

// Local PNG reference images for Gemini style transfer
export const GEMINI_REFERENCE_IMAGES = [
  '/refs/ref-1.png',
  '/refs/ref-2.png',
  '/refs/ref-3.png',
]

export const GEMINI_SYSTEM_PROMPT = `Create a tiny 8-bit pixel art icon. Study the reference images carefully - match their exact style and level of detail.

Style guide:
- Small 32x32 pixel resolution with chunky, visible pixel blocks
- 8-bit retro aesthetic (NES, Game Boy era)
- Limited palette: 8-12 flat colors, no gradients
- Solid white background
- Simple, minimal shapes - less detail is better
- 1-pixel black outlines
- No anti-aliasing or smooth edges
- Cute, kawaii style like the references

The reference images show exactly what we want: simple, blocky, charming pixel art icons. Please match that same level of simplicity.`

export const NAV_LINKS = [
  { href: '/', label: 'Home', isActive: true },
  { href: '/explore', label: 'Explore' },
  { href: '/studio', label: 'Studio' },
] as const

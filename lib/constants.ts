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

export const CREDIT_PACKS = [
  {
    name: 'Tiny',
    credits: 5,
    price: 499,
    displayPrice: '$4.99',
    productId: {
      sandbox: '704e3a00-9377-460e-8a82-f0c0dd9d7667',
      production: '7c7322ec-2f43-4b83-bce4-237ed9ea2e72',
    },
  },
  {
    name: 'Medium',
    credits: 20,
    price: 1499,
    displayPrice: '$14.99',
    productId: {
      sandbox: 'e21fc251-dee3-42bd-9cf1-bc0f53679766',
      production: '7e95db23-fa84-477d-9ac9-1c167734886a',
    },
    popular: true,
  },
  {
    name: 'Mega',
    credits: 60,
    price: 3999,
    displayPrice: '$39.99',
    productId: {
      sandbox: 'a8b5a688-98b4-4d7a-8367-b8e47ade4786',
      production: 'f76b4d47-2458-4d4c-9502-e8c2b457678a',
    },
  },
] as const

export const NAV_LINKS = [
  { href: '/', label: 'Home', isActive: true },
  { href: '/explore', label: 'Explore' },
  { href: '/studio', label: 'Studio' },
] as const

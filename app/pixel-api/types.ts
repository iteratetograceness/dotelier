import { z } from 'zod'

export const API_STYLES = ['color_v2'] as const
export type ApiStyle = (typeof API_STYLES)[number]

export const PixelApiResponseSchema = z.object({
  images: z.array(
    z.object({
      base64: z.string(),
      url: z.string(),
      fileKey: z.string(),
    })
  ),
  inference_time: z.number(),
})
export type PixelApiResponse = z.infer<typeof PixelApiResponseSchema>

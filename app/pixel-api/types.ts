import { z } from 'zod'

export type ModelType = 'flux' | 'gemini'

export const PixelApiResponseSchema = z.object({
  images: z.array(
    z.object({
      base64: z.string({
        message: 'The base64 representation of initial PNG generation',
      }),
      url: z.string({
        message: 'The URL of the initial PNG upload',
      }),
      fileKey: z.string({
        message: 'The file key to the initial PNG upload',
      }),
    })
  ),
  inference_time: z.number(),
})
export type PixelApiResponse = z.infer<typeof PixelApiResponseSchema>

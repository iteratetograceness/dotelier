import { z } from 'zod'

export const PixelApiResponseSchema = z.object({
  images: z.array(
    z.object({
      base64: z.string({
        description: 'The base64 representation of initial PNG generation',
      }),
      url: z.string({
        description: 'The URL of the initial PNG upload',
      }),
      fileKey: z.string({
        description: 'The file key to the initial PNG upload',
      }),
    })
  ),
  inference_time: z.number(),
})
export type PixelApiResponse = z.infer<typeof PixelApiResponseSchema>

import { flag } from '@vercel/flags/next'

export const styleIdFlag = flag({
  key: 'style-id',
  adapter: vercelAdapter(),
})

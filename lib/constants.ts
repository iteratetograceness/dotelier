import { getBaseUrl } from './base-url'

export const PIXELATE_API = getBaseUrl('/api/pixelate')
export const VECTORIZE_API = getBaseUrl('/api/vectorize')

export enum JobStatus {
  QUEUED = 'queued',
  INITIATED = 'initiated',
  INFERENCE = 'inference',
  POST_PROCESSING = 'post_processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

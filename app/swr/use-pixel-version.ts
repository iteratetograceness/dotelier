import useSWR, { mutate } from 'swr'
import { fetcher } from './shared'

export interface GridSettings {
  downscaleMethod?: 'dominant' | 'median' | 'mode' | 'mean' | 'nearest' | 'content-adaptive'
  maxColors?: number
  alphaThreshold?: number
  fillThreshold?: number
  snapGrid?: boolean
  cleanup?: { morph?: boolean; jaggy?: boolean }
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  downscaleMethod: 'dominant',
  maxColors: 32,
  alphaThreshold: 128,
  fillThreshold: 61,
  snapGrid: true,
  cleanup: { morph: false, jaggy: true },
}

export interface LatestPixelVersion {
  id: string
  fileKey: string
  version: number
  gridSize: number
  gridSettings: GridSettings | null
}

export function usePixelVersion({
  id,
  initialData,
}: {
  id?: string
  initialData?: LatestPixelVersion
}) {
  const { data, mutate, isLoading } = useSWR<LatestPixelVersion | undefined>(
    id ? `/api/pixels/${id}/latest` : null,
    fetcher,
    {
      fallbackData: initialData,
      revalidateIfStale: false,
      revalidateOnMount: !initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000, // Prevent duplicate requests within 2s
    }
  )

  return { data, mutate, isLoading }
}

export function revalidatePixelVersion(id: string) {
  return mutate(`/api/pixels/${id}/latest`)
}

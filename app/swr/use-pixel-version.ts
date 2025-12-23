import useSWR, { mutate } from 'swr'
import { fetcher } from './shared'
import type { GridSettings } from '@/lib/grid-settings'

// Re-export from shared file for backwards compatibility
export { DEFAULT_GRID_SETTINGS } from '@/lib/grid-settings'
export type { GridSettings } from '@/lib/grid-settings'

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

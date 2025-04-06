import useSWR, { mutate } from 'swr'
import { fetcher } from './shared'

export interface LatestPixelVersion {
  id: string
  fileKey: string
  version: number
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
      revalidateOnMount: false,
      revalidateOnFocus: false,
    }
  )

  return { data, mutate, isLoading }
}

export function revalidatePixelVersion(id: string) {
  return mutate(`/api/pixels/${id}/latest`)
}

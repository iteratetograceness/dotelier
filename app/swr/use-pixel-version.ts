import useSWR, { mutate } from 'swr'
import { fetcher } from './shared'

export interface LatestPixelVersion {
  id: string
  fileKey: string
}

export function usePixelVersion({
  id,
  initialData,
}: {
  id?: string
  initialData?: LatestPixelVersion
}) {
  const { data, mutate, isLoading } = useSWR<LatestPixelVersion | undefined>(
    id ? `/api/pixel/${id}/latest` : null,
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
  return mutate(`/api/pixel/${id}/latest`)
}

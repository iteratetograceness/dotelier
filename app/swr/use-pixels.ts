import { useSession } from '@/lib/auth/client'
import { Pixel } from '@/lib/db/types'
import useSWR from 'swr'

export const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

export function usePixels(page: number = 1) {
  const { data: session } = useSession()
  const { data, isLoading, error } = useSWR<Pick<Pixel, 'id' | 'prompt'>[]>(
    session ? `/api/pixels?page=${page}` : null,
    fetcher
  )

  return {
    data,
    isLoading,
    error,
  }
}

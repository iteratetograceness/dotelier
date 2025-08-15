import { useSession } from '@/lib/auth/client'
import { Pixel } from '@/lib/db/types'
import useSWR from 'swr'

export const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PixelsResponse = {
  pixels: Pick<Pixel, 'id' | 'prompt'>[]
  pagination: PaginationMeta
}

export function usePixels(page: number = 1) {
  const { data: session } = useSession()
  const { data, isLoading, error } = useSWR<PixelsResponse>(
    session ? `/api/pixels?page=${page}` : null,
    fetcher
  )

  return {
    data: data?.pixels,
    pagination: data?.pagination,
    isLoading,
    error,
  }
}

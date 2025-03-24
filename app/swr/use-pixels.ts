import useSWRInfinite from 'swr/infinite'
import { PixelLite } from '../db/supabase/types'
import { fetcher } from './shared'

const getKey = (page: number, previousPageData: PixelLite[]) => {
  if (previousPageData && !previousPageData.length) return null
  return `/api/pixels?p=${page}`
}

export function usePixelsInfinite() {
  const { data, error, isLoading, mutate, size, setSize } = useSWRInfinite<
    PixelLite[]
  >(getKey, fetcher, { parallel: true })

  console.log('data', data)

  return {
    pixels: data,
    isLoading,
    isError: error,
    mutate,
    pages: size,
    setPages: setSize,
  }
}

import useSWRInfinite from 'swr/infinite'
import { Job } from '../db/supabase/types'
import { fetcher } from './shared'

const getKey = (page: number, previousPageData: Job[]) => {
  if (previousPageData && !previousPageData.length) return null
  return `/api/jobs?p=${page}`
}

export function useJobsInfinite() {
  const { data, error, isLoading, mutate, size, setSize } = useSWRInfinite<
    Pick<Job, 'id' | 'prompt' | 'status' | 'updated_at'>[]
  >(getKey, fetcher, { parallel: true })

  return {
    jobs: data,
    isLoading,
    isError: error,
    mutate,
    pages: size,
    setPages: setSize,
  }
}

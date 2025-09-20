import { useSession } from '@/lib/auth/client'
import { useCallback } from 'react'
import useSWR from 'swr'
import { fetcher } from './shared'

export function useCredits() {
  const { data: sessionData } = useSession()
  const { data, error, isLoading, mutate } = useSWR<{ credits: number }>(
    sessionData ? '/api/credits' : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const revalidateCredits = useCallback(
    (credits: number) => {
      return mutate(
        { credits },
        {
          revalidate: false,
        }
      )
    },
    [mutate]
  )

  return {
    credits: data?.credits,
    isLoading,
    isError: error,
    revalidateCredits,
  }
}

'use client'

import { fetcher, usePixels } from '@/app/swr/use-pixels'
import { useSearchParams } from 'next/navigation'
import { preload } from 'swr'
import { Grid } from './grid'
import { Pagination } from './pagination'

preload('/api/pixels?page=1', fetcher)

export function PaginatedGrid() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const currentPage = page ? Number(page) : 1
  const { data, pagination, isLoading } = usePixels(currentPage)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='flex flex-col gap-4 min-w-full'>
      <Grid pixels={data} />
      {pagination && <Pagination pagination={pagination} />}
    </div>
  )
}

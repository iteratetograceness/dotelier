'use client'

import { fetcher, usePixels } from '@/app/swr/use-pixels'
import { useSearchParams } from 'next/navigation'
import { preload } from 'swr'
import { GridItem } from './grid-item'

preload('/api/pixels?page=1', fetcher)

export function PaginatedGrid() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page')
  const { data, isLoading } = usePixels(page ? Number(page) : 1)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 pt-5'>
        {data?.map((pixel) => (
          <GridItem key={pixel.id} {...pixel} />
        ))}
      </div>
      {/* pagination */}
    </div>
  )
}

'use client'

import { Pixel } from '@/lib/db/types'
import { GridItem } from './grid-item'

export function Grid({ pixels }: { pixels?: Pick<Pixel, 'prompt' | 'id'>[] }) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 pt-5 w-full'>
      {pixels?.map((pixel) => (
        <GridItem key={pixel.id} {...pixel} />
      ))}
    </div>
  )
}

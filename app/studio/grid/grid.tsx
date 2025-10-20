'use client'

import { GridItem } from './grid-item'

type PixelWithVersion = {
  id: string
  prompt: string
  fileKey?: string | null
  version?: number | null
  versionId?: string | null
}

export function Grid({ pixels }: { pixels?: PixelWithVersion[] }) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 pt-5 w-full'>
      {pixels?.map((pixel, index) => (
        <GridItem key={pixel.id} {...pixel} index={index} />
      ))}
    </div>
  )
}

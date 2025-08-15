import { getExplorePagePixels } from '@/lib/db/queries'
import { Suspense } from 'react'
import { Grid } from '../studio/grid/grid'

export default async function Explore() {
  const pixels = await getExplorePagePixels(1, 50)

  return (
    <div className='size-full flex items-center justify-center min-w-full'>
      <Suspense fallback={<div>Loading...</div>}>
        <Grid pixels={pixels} />
      </Suspense>
    </div>
  )
}

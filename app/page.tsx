import { Suspense } from 'react'
import { StudioServer } from './_components/studio/server'
import { StudioSkeleton } from './_components/studio/skeleton'

export default function Home() {
  return (
    <div className='py-7 sm:py-0'>
      <Suspense fallback={<StudioSkeleton />}>
        <StudioServer />
      </Suspense>
    </div>
  )
}

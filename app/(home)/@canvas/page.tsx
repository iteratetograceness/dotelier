import { NewCanvas } from '@/app/_components/studio/new-canvas'
import { CanvasSkeleton } from '@/app/_components/studio/pixels/skeleton'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<CanvasSkeleton />}>
      <NewCanvas />
    </Suspense>
  )
}

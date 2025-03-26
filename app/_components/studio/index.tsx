import { getLatestPixelVersion } from '@/lib/db/queries'
import { Pixel } from '@/lib/db/types'
import { Suspense } from 'react'
import { Carousel } from '../carousel'
import { Canvas } from './canvas'
import { NewCanvas } from './new-canvas'
import { CanvasSkeleton } from './skeleton'

/**
 * Need to do:
 *
 * - Fetch users' pixels to display in CANVAS
 * - In-canvas functionality
 */

export const preload = (id: string) => {
  void getLatestPixelVersion(id)
}

export type StudioPixel = Pick<
  Pixel,
  'id' | 'prompt' | 'createdAt' | 'updatedAt' | 'showExplore'
>

export function Studio({
  className,
  pixels,
}: {
  className?: string
  pixels: StudioPixel[]
}) {
  return (
    <Carousel className={className}>
      <Suspense fallback={<CanvasSkeleton />}>
        <NewCanvas />
      </Suspense>
      {pixels.map((pixel) => (
        <Suspense key={pixel.id} fallback={<CanvasSkeleton />}>
          <Canvas
            key={pixel.id}
            pixel={pixel}
            versionPromise={getLatestPixelVersion(pixel.id)}
          />
        </Suspense>
      ))}
    </Carousel>
  )
}

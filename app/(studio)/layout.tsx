import { getSession } from '@/lib/auth/session'
import { getLatestPixelVersion, getPixelIdsByOwner } from '@/lib/db/queries'
import { warmupServer } from '@/lib/warm-up'
import { Suspense } from 'react'
import { Carousel } from '../_components/carousel'
import { PixelCanvas } from '../_components/studio/pixels/canvas'
import { CanvasSkeleton } from '../_components/studio/pixels/skeleton'

export default async function StudioLayout({
  canvas,
}: {
  canvas: React.ReactNode
}) {
  warmupServer()

  const data = await getSession()
  const pixelIds = data?.user
    ? await getPixelIdsByOwner({
        ownerId: data.user.id,
        limit: 4,
      })
    : []

  return (
    <div className='py-7 md:my-auto'>
      <Carousel>
        {canvas}
        {pixelIds.map(({ id }) => (
          <Suspense key={id} fallback={<CanvasSkeleton />}>
            <PixelCanvas id={id} versionPromise={getLatestPixelVersion(id)} />
          </Suspense>
        ))}
      </Carousel>
    </div>
  )
}

import { getSession } from '@/lib/auth/session'
import { getLatestPixelIds, getLatestPixelVersion } from '@/lib/db/queries'
import { Suspense } from 'react'
import { PixelCanvas } from './canvas'
import { CanvasSkeleton } from './skeleton'

const getPixelIds = async () => {
  const session = await getSession()
  const pixelIds = session?.user ? await getLatestPixelIds(session.user.id) : []
  return pixelIds
}

async function PixelGroupItem({ promise }: { promise: Promise<string> }) {
  const id = await promise
  if (!id) return null
  return <PixelCanvas id={id} versionPromise={getLatestPixelVersion(id)} />
}

export function PixelGroup() {
  const pixelIdsPromise = getPixelIds()
  const pixelPromises = Array.from({ length: 3 }, async (_, i) => {
    const ids = await pixelIdsPromise
    return ids[i]?.id
  })

  return pixelPromises.map((promise, i) => (
    <Suspense key={`recent-pixel-${i}`} fallback={<CanvasSkeleton />}>
      <PixelGroupItem promise={promise} />
    </Suspense>
  ))
}

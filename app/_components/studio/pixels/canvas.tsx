import { LatestPixelVersion } from '@/app/swr/use-pixel-version'
import { getPixelById } from '@/lib/db/queries'
import { unstable_cacheTag } from 'next/cache'
import { Canvas } from './canvas.client'

export async function PixelCanvas({
  id,
  versionPromise,
}: {
  id: string
  versionPromise: Promise<LatestPixelVersion | undefined>
}) {
  'use cache'
  unstable_cacheTag(`pixel:${id}`)
  const pixel = await getPixelById(id)
  if (!pixel) return
  return <Canvas key={pixel.id} pixel={pixel} versionPromise={versionPromise} />
}

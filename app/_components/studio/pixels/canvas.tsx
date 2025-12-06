import { LatestPixelVersion } from '@/app/swr/use-pixel-version'
import { getPixelById } from '@/lib/db/queries'
import { cacheTag } from 'next/cache'
import { Canvas } from './canvas.client'

export async function PixelCanvas({
  id,
  versionPromise,
}: {
  id: string
  versionPromise: Promise<LatestPixelVersion | undefined>
}) {
  'use cache'
  cacheTag(`pixel:${id}`)
  const pixel = await getPixelById(id)
  if (!pixel) return
  return <Canvas key={pixel.id} pixel={pixel} versionPromise={versionPromise} />
}

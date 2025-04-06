import { LatestPixelVersion } from '@/app/swr/use-pixel-version'
import { getPixelById } from '@/lib/db/queries'
import { Canvas } from './canvas.client'

export async function PixelCanvas({
  id,
  versionPromise,
}: {
  id: string
  versionPromise: Promise<LatestPixelVersion | undefined>
}) {
  const pixel = await getPixelById(id)
  if (!pixel) return
  return <Canvas key={pixel.id} pixel={pixel} versionPromise={versionPromise} />
}

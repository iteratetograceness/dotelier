import { getPixelById } from '@/lib/db/queries'
import { Canvas } from './canvas.client'

export async function PixelCanvas({
  id,
  versionPromise,
}: {
  id: string
  versionPromise: Promise<
    | {
        id: string
        fileKey: string
      }
    | undefined
  >
}) {
  const pixel = await getPixelById(id)
  if (!pixel) return
  return <Canvas key={pixel.id} pixel={pixel} versionPromise={versionPromise} />
}

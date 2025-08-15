import { Pill } from '@/app/_components/pill'
import { Canvas } from '@/app/_components/studio/pixels/canvas.client'
import { getLatestPixelVersion } from '@/lib/db/queries'
import { UneditedImage } from './unedited-image'

export function MyPixelView({
  pixel,
}: {
  pixel: {
    id: string
    createdAt: Date
    prompt: string
    showExplore: boolean
    updatedAt: Date | null
    userId: string
  }
}) {
  const versionPromise = getLatestPixelVersion(pixel.id)
  // TODO: Version selector

  return (
    <div className='flex flex-col gap-6 w-full p-6 items-center'>
      <div className='align-left w-full bg-light-shadow p-2 pixel-corners pixel-border-light-shadow text-highlight flex flex-col gap-2'>
        <h2 className='text-2xl'>{pixel.prompt}</h2>
        <div className='flex gap-2'>
          <Pill variant='dark'>{pixel.createdAt.toLocaleDateString()}</Pill>
          <Pill variant='dark'>{pixel.createdAt.toLocaleTimeString()}</Pill>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 pb-14'>
        <div>
          <Canvas pixel={pixel} versionPromise={versionPromise} />
        </div>
        <div>
          <UneditedImage versionPromise={versionPromise} />
        </div>
      </div>
    </div>
  )
}

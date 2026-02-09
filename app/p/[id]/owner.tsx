import { Button } from '@/app/_components/button'
import { Pill } from '@/app/_components/pill'
import { Canvas } from '@/app/_components/studio/pixels/canvas.client'
import { DeletePixelButton } from '@/app/_components/studio/pixels/delete-button'
import { getLatestPixelVersion } from '@/lib/db/queries'
import Image from 'next/image'
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
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full'>
        <h2 className='text-2xl text-accent truncate'>{pixel.prompt}</h2>
        <div className='flex gap-2 items-center sm:ml-auto shrink-0'>
          <Pill variant='dark'>{pixel.createdAt.toLocaleDateString()}</Pill>
          <Pill variant='dark'>{pixel.createdAt.toLocaleTimeString()}</Pill>
          <DeletePixelButton pixelId={pixel.id}>
            <Button
              aria-label='Delete pixel'
              iconOnly
              variant='primary'
              className='size-9!'
            >
              <Image
                src='/editor/trash.png'
                alt='Delete'
                width={20}
                height={20}
              />
            </Button>
          </DeletePixelButton>
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

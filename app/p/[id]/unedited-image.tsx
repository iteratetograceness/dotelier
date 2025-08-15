import { Pill } from '@/app/_components/pill'
import { LatestPixelVersion } from '@/app/swr/use-pixel-version'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
import { use } from 'react'

export function UneditedImage({
  versionPromise,
}: {
  versionPromise: Promise<LatestPixelVersion | undefined>
}) {
  const version = use(versionPromise)
  if (!version) return null

  return (
    <div className='relative mt-6 aspect-square w-fit'>
      <Pill
        variant='dark'
        className='absolute -top-4 left-1/2 -translate-x-1/2 z-10'
      >
        Original
      </Pill>
      <div className='bg-medium pixel-corners pixel-border-medium p-2'>
        <Image
          src={getPublicPixelAsset(version.fileKey)}
          alt='Unedited image'
          width={300}
          height={300}
        />
      </div>
    </div>
  )
}

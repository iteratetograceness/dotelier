import { usePixelVersion } from '@/app/swr/use-pixel-version'
import { Pixel } from '@/lib/db/types'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
import Link from 'next/link'

export function GridItem(pixel: Pick<Pixel, 'id' | 'prompt'>) {
  const { data } = usePixelVersion({ id: pixel.id })

  // loading state

  return (
    <Link
      href={`/studio/${pixel.id}`}
      className='flex flex-col gap-2 pixel-corners pixel-border-accent p-4 bg-white'
    >
      <div className='text-sm text-light-shadow'>{pixel.prompt}</div>
      <div className='relative size-full'>
        <Image
          src={getPublicPixelAsset(data?.fileKey ?? '')}
          alt={pixel.prompt}
          width={100}
          height={100}
          className='size-full object-cover'
        />
      </div>
    </Link>
  )
}

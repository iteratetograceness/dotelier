import { usePixelVersion } from '@/app/swr/use-pixel-version'
import { Pixel } from '@/lib/db/types'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
import Link from 'next/link'

export function GridItem(pixel: Pick<Pixel, 'id' | 'prompt'>) {
  const { data } = usePixelVersion({ id: pixel.id })

  // loading state

  return (
    <div className='flex flex-col gap-2 pixel-corners pixel-border-accent bg-foreground relative'>
      <Link href={`/p/${pixel.id}`} className='flex flex-col gap-2'>
        <div className='relative w-full h-auto bg-hover pixel-corners-top pixel-border-highlight aspect-square'>
          <Image
            src={getPublicPixelAsset(data?.fileKey ?? '')}
            alt={pixel.prompt}
            width={100}
            height={100}
            className='size-full object-cover'
          />
        </div>
        <div className='text-xs text-medium px-4 pt-1 pb-2 w-full'>
          {pixel.prompt}
        </div>
      </Link>
    </div>
  )
}

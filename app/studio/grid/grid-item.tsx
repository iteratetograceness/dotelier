import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
import Link from 'next/link'

type GridItemProps = {
  id: string
  prompt: string
  fileKey?: string | null
  version?: number | null
  index: number
}

export function GridItem({ id, prompt, fileKey, index }: GridItemProps) {
  // Prioritize first 6 items (typically above the fold)
  const isPriority = index < 6

  return (
    <div className='flex flex-col gap-2 pixel-corners pixel-border-accent bg-foreground relative'>
      <Link href={`/p/${id}`} className='flex flex-col gap-2'>
        <div className='relative w-full h-auto bg-hover pixel-corners-top pixel-border-highlight aspect-square'>
          {fileKey ? (
            <Image
              src={getPublicPixelAsset(fileKey)}
              alt={prompt}
              width={100}
              height={100}
              sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw'
              loading={isPriority ? 'eager' : 'lazy'}
              priority={isPriority}
              className='size-full object-cover'
            />
          ) : (
            <div className='size-full bg-hover animate-pulse' />
          )}
        </div>
        <div className='text-xs text-medium px-4 pt-1 pb-2 w-full'>
          {prompt}
        </div>
      </Link>
    </div>
  )
}

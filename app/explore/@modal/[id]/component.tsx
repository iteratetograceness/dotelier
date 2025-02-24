'use client'

import { Button, ButtonLink } from '@/app/_components/button'
import { BaseWindow } from '@/app/_components/window/base'
import { getPublicPixelAsset } from '@/app/db/supabase/storage'
import { Pixel } from '@/app/db/supabase/types'
import { downloadIcon } from '@/app/utils/download'
import { useUser } from '@/app/utils/use-user'
import { useDraggable } from '@neodrag/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useRef } from 'react'

export default function IconDetails({ icon }: { icon: Pixel }) {
  const router = useRouter()
  const { user } = useUser()
  const handleRef = useRef<HTMLDivElement>(null!)
  const draggableRef = useRef<HTMLDivElement>(null!)
  const imageSrc = useMemo(
    () => getPublicPixelAsset(icon.file_path),
    [icon.file_path]
  )
  const showEditButton = useMemo(
    () => user?.id === icon.user_id,
    [user?.id, icon.user_id]
  )

  useDraggable(draggableRef, {
    bounds: '#icon-grid',
    handle: handleRef.current,
    cancel: 'button',
    gpuAcceleration: true,
    legacyTranslate: true,
  })

  return (
    <div className='absolute top-[43px] left-[calc((100vw-292px)/2)] sm:left-1/2 sm:-translate-x-1/2 xs:top-1/2 xs:-translate-y-1/2 w-[292px] sm:w-[300px] z-50'>
      <BaseWindow
        ref={draggableRef}
        handleRef={handleRef}
        className='pointer-events-auto h-[592px] sm:h-auto'
        onClose={() => router.back()}
        innerClassName='p-0'
      >
        <div className='flex flex-col gap-4'>
          <div className='border-[2px] border-shadow border-r-highlight border-b-highlight'>
            <Image
              src={imageSrc}
              alt={`Pixelated icon generated from prompt: ${icon.prompt}`}
              width={250}
              height={250}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-sm inline-flex gap-2 items-center'>
              <span className='bg-foreground text-background px-1'>Prompt</span>
              {icon.prompt}
            </p>
            <p className='text-sm inline-flex gap-2 items-center'>
              <span className='bg-foreground text-background px-1'>Style</span>
              {icon.style}
            </p>
          </div>
          <div className='flex gap-2'>
            {showEditButton && (
              <ButtonLink
                className='text-sm flex-1 text-center'
                href={`/edit/${icon.id}`}
              >
                Edit
              </ButtonLink>
            )}
            <Button
              className='text-sm flex-1'
              onClick={() =>
                downloadIcon({ src: imageSrc, prompt: icon.prompt })
              }
            >
              Download
            </Button>
          </div>
        </div>
      </BaseWindow>
    </div>
  )
}

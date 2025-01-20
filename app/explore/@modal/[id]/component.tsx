'use client'

import { Button } from '@/app/_components/button'
import { PublicIcon } from '@/app/_components/explore/icon'
import { BaseWindow } from '@/app/_components/window/base'
import { DownloadIcon } from '@/app/icons/download'
import { useDraggable } from '@neodrag/react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export default function IconDetails({ icon }: { icon: PublicIcon }) {
  const router = useRouter()
  const handleRef = useRef<HTMLDivElement>(null!)
  const draggableRef = useRef<HTMLDivElement>(null!)

  useDraggable(draggableRef, {
    bounds: '#icon-grid',
    handle: handleRef.current,
    cancel: 'button',
    gpuAcceleration: true,
    legacyTranslate: true,
  })

  return (
    <div className='absolute top-[43px] left-[calc((100vw-292px)/2)] sm:left-1/2 sm:-translate-x-1/2 xs:top-1/2 xs:-translate-y-1/2 w-[292px] sm:w-[500px] z-50'>
      <BaseWindow
        ref={draggableRef}
        handleRef={handleRef}
        className='pointer-events-auto h-[592px] xs:h-auto'
        onClose={() => router.back()}
        innerClassName='p-0'
      >
        <div className='relative'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon.url}
            alt={`Pixelated icon generated from prompt: ${icon.prompt}`}
            className='w-full aspect-square h-auto bg-medium dark:bg-accent p-10 pb-36 sm:pb-30'
          />
          <div className='absolute bottom-4 left-4 size-fit p-4 border bg-foreground dark:bg-background text-sm text-background dark:text-foreground flex flex-col w-full sm:w-fit'>
            {/* Prompt */}
            <p>
              {'> '}--prompt &nbsp;&quot;{icon.prompt}&quot;
            </p>
            {/* Creator, if available */}
            {icon.owner?.name && (
              <p>
                {'> '}--author &nbsp;&quot;{icon.owner?.name}&quot;
              </p>
            )}
            {/* Date created */}
            <p>
              {'> '}--created_at &nbsp;&quot;
              {icon.created_at?.toLocaleDateString() || 'N/A'}&quot;
            </p>
            {/* TODO: Categories, if available */}
          </div>
          <Button
            className='absolute top-4 right-4 text-foreground size-10 flex items-center justify-center'
            iconOnly
          >
            <span className='sr-only'>Download</span>
            <DownloadIcon />
          </Button>
        </div>
      </BaseWindow>
    </div>
  )
}

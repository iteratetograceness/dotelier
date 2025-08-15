'use client'

import { cn } from '@/app/utils/classnames'
import Image from 'next/image'
import { Popover } from 'radix-ui'
import { Button, ButtonProps } from '../button'

type DownloadButtonProps = ButtonProps & {
  onDownload?: (as: 'svg' | 'png') => void
  disablePng?: boolean
  disableSvg?: boolean
}

export function DownloadButton(props: DownloadButtonProps) {
  const { onDownload, disablePng = false, disableSvg = false, ...rest } = props

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button {...rest}>
          {props.iconOnly ? (
            <Image
              src='/editor/download.png'
              alt='Download'
              width={25}
              height={25}
              className={cn(props.disabled && 'opacity-50')}
            />
          ) : (
            'download'
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal
        container={typeof document !== 'undefined' ? document.body : undefined}
      >
        <Popover.Content
          className='flex flex-col w-36 text-xs bg-background border border-border rounded-md shadow-lg p-1 z-50'
          align='start'
          side='bottom'
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={8}
        >
          <Button
            className='w-full'
            onClick={() => onDownload?.('png')}
            disabled={disablePng}
          >
            As PNG
          </Button>
          <Button
            className='w-full'
            onClick={() => onDownload?.('svg')}
            disabled={disableSvg}
          >
            As SVG
          </Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

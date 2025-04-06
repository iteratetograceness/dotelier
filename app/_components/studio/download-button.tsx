'use client'

import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@radix-ui/react-popover'
import Image from 'next/image'
import { Button, ButtonProps } from '../button'

type DownloadButtonProps = ButtonProps & {
  onDownload?: (as: 'svg' | 'png') => void
  disablePng?: boolean
  disableSvg?: boolean
}

export function DownloadButton(props: DownloadButtonProps) {
  const { onDownload, disablePng = false, disableSvg = false, ...rest } = props

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button {...rest}>
          {props.iconOnly ? (
            <Image
              src='/editor/download.png'
              alt='Download'
              width={25}
              height={25}
            />
          ) : (
            'download'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          className='flex flex-col w-36 text-xs'
          align='start'
          side='bottom'
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
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

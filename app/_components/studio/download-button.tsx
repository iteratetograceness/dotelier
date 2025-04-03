import Image from 'next/image'
import { Button, ButtonProps } from '../button'

// Popover: as svg OR as png

export function DownloadButton(props: ButtonProps & { icon?: boolean }) {
  return (
    <Button iconOnly={props.icon} {...props}>
      {props.icon ? (
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
  )
}

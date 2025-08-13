'use client'

import { Popover } from 'radix-ui'
import { useState } from 'react'
import { Button, ButtonProps } from '../button'

const SIZES = [1, 2, 3, 4]

type PenSizeProps = Omit<ButtonProps, 'onChange'> & {
  onChange: (size: number) => void
}

export function PenSize({ onChange, ...props }: PenSizeProps) {
  const [size, setSize] = useState(1)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button {...props}>{size}</Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='flex flex-col w-36 text-xs'
          align='start'
          side='bottom'
        >
          {SIZES.map((s) => (
            <Button
              key={s}
              onClick={() => {
                setSize(s)
                onChange(s)
              }}
              className='w-full'
              disabled={size === s}
            >
              {s}
            </Button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

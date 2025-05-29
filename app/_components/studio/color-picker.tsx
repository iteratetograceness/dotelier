import { cn } from '@/app/utils/classnames'
import { Popover } from 'radix-ui'
import { useCallback } from 'react'
import { HexColorInput, RgbaColorPicker } from 'react-colorful'
import './color-picker.css'
import { TooltipWrapper } from './pixels/canvas.client'

interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export default function ColorPicker({
  disabled,
  setRgbaColor,
  rgbaColor,
}: {
  disabled: boolean
  rgbaColor: RgbaColor
  setRgbaColor: (color: RgbaColor) => void
}) {
  const changeColor = useCallback(
    (color: RgbaColor) => {
      setRgbaColor(color)
    },
    [setRgbaColor]
  )

  return (
    <Popover.Root>
      <TooltipWrapper content='Tool Color'>
        <Popover.Trigger
          disabled={disabled}
          className='size-10 border-3 border-shadow border-r-background border-b-background'
          style={{
            backgroundColor: `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`,
          }}
        />
      </TooltipWrapper>
      <Popover.Portal>
        <Popover.Content
          avoidCollisions
          collisionPadding={40}
          side='bottom'
          align='start'
          className='z-100'
        >
          <div
            className={cn(
              'pixel-color-picker',
              'flex flex-col gap-2',
              ' p-2 bg-background',
              'border border-r-light-shadow border-b-light-shadow border-highlight'
            )}
          >
            <RgbaColorPicker color={rgbaColor} onChange={changeColor} />
            <div className='relative inline-flex items-center'>
              <span className='absolute left-2 text-foreground'>#</span>
              <HexColorInput
                className={cn(
                  'px-1 border-3 border-shadow border-r-background border-b-background',
                  'active:outline-hidden focus:outline-hidden pl-6'
                )}
                color={rgbaToHex(
                  rgbaColor.r,
                  rgbaColor.g,
                  rgbaColor.b,
                  rgbaColor.a
                )}
                onChange={(color) => {
                  const rgba = hexToRgba(color)
                  changeColor(rgba)
                }}
                placeholder='#000000'
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const alpha = Math.round(a * 255)

  return '#' + toHex(r) + toHex(g) + toHex(b) + toHex(alpha)
}

export function hexToRgba(hex: string): {
  r: number
  g: number
  b: number
  a: number
} {
  hex = hex.replace('#', '')

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1

  return { r, g, b, a }
}

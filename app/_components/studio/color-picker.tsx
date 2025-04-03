import { cn } from '@/app/utils/classnames'
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@radix-ui/react-popover'
import { useCallback, useState } from 'react'
import { HexColorInput, RgbaColorPicker } from 'react-colorful'
import './color-picker.css'

interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

export default function ColorPicker({
  onChange,
}: {
  onChange: (color: RgbaColor) => void
}) {
  const [rgbaColor, setRgbaColor] = useState<RgbaColor>({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  })

  const changeColor = useCallback(
    (color: RgbaColor) => {
      setRgbaColor(color)
      onChange(color)
    },
    [onChange]
  )

  return (
    <Popover>
      <PopoverTrigger
        className='size-10 border-[2px] border-shadow border-r-background border-b-background'
        style={{
          backgroundColor: `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`,
        }}
      />
      <PopoverPortal>
        <PopoverContent
          avoidCollisions
          collisionPadding={40}
          sideOffset={5}
          side='bottom'
          align='start'
          className='z-[100]'
        >
          <div
            className={cn(
              'pixel-color-picker',
              'flex flex-col gap-2',
              'pixel-corners pixel-border-light-shadow p-2 bg-background'
            )}
          >
            <RgbaColorPicker color={rgbaColor} onChange={changeColor} />
            <div className='relative inline-flex items-center'>
              <span className='absolute left-2 text-foreground'>#</span>
              <HexColorInput
                className={cn(
                  'px-1 border-[2px] border-shadow border-r-background border-b-background',
                  'active:outline-none focus:outline-none pl-6'
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
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
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

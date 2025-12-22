'use client'

import { cn } from '@/app/utils/classnames'
import { RgbaColor } from 'react-colorful'
import { TooltipWrapper } from './pixels/canvas.client'

interface PaletteProps {
  colors: Array<[number, number, number, number]>
  selectedColor: RgbaColor
  onColorSelect: (color: RgbaColor) => void
  disabled?: boolean
  maxColors?: number
}

export function Palette({
  colors,
  selectedColor,
  onColorSelect,
  disabled = false,
  maxColors = 16,
}: PaletteProps) {
  if (colors.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-2 bg-hover border-3 border-white border-r-shadow border-b-shadow',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <span className='text-xs font-bold text-shadow'>Palette</span>
      <div className='flex flex-wrap gap-0.5'>
        {colors.slice(0, maxColors).map((color, i) => {
          const [r, g, b, a] = color
          const isSelected =
            selectedColor.r === r &&
            selectedColor.g === g &&
            selectedColor.b === b &&
            Math.round(selectedColor.a * 255) === a
          return (
            <TooltipWrapper key={i} content={`rgb(${r},${g},${b})`}>
              <button
                className={cn(
                  'size-6 border-2 cursor-pointer',
                  isSelected
                    ? 'border-accent'
                    : 'border-shadow border-r-highlight border-b-highlight'
                )}
                style={{
                  backgroundColor: `rgba(${r},${g},${b},${a / 255})`,
                }}
                onClick={() => onColorSelect({ r, g, b, a: a / 255 })}
                disabled={disabled}
                aria-label={`Color ${i + 1}`}
              />
            </TooltipWrapper>
          )
        })}
      </div>
    </div>
  )
}

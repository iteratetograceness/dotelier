'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '../button'
import { cn } from '@/app/utils/classnames'

interface GridSettingsProps {
  gridSize: number
  onGridSizeChange: (size: number) => void
  disabled?: boolean
}

export function GridSettingsPanel({
  gridSize,
  onGridSizeChange,
  disabled = false,
}: GridSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [gridSizeInput, setGridSizeInput] = useState(String(gridSize))
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setGridSizeInput(String(gridSize))
  }, [gridSize])

  const handleGridSizeInputChange = useCallback(
    (value: string) => {
      setGridSizeInput(value)
      const parsed = parseInt(value)
      if (!isNaN(parsed) && parsed >= 8 && parsed <= 128) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
        debounceRef.current = setTimeout(() => {
          onGridSizeChange(parsed)
        }, 500)
      }
    },
    [onGridSizeChange]
  )

  const handleGridSizeBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    const parsed = parseInt(gridSizeInput)
    if (!isNaN(parsed) && parsed >= 8 && parsed <= 128) {
      onGridSizeChange(parsed)
    } else {
      setGridSizeInput(String(gridSize))
    }
  }, [gridSizeInput, gridSize, onGridSizeChange])

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-2 bg-hover border-3 border-white border-r-shadow border-b-shadow overflow-visible',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold text-shadow'>Grid Settings</span>
        <Button
          aria-label={isOpen ? 'Hide grid settings' : 'Show grid settings'}
          aria-expanded={isOpen}
          className='text-xs! px-2! py-0.5!'
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isOpen && (
        <div className='flex flex-col gap-2 pt-2 border-t border-shadow'>
          <div className='flex flex-col gap-0.5'>
            <label className='text-xs text-shadow'>Size</label>
            <input
              type='number'
              min='8'
              max='128'
              value={gridSizeInput}
              onChange={(e) => handleGridSizeInputChange(e.target.value)}
              onBlur={handleGridSizeBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGridSizeBlur()
                }
              }}
              className='w-full px-2 py-1 text-xs bg-white border-3 border-shadow border-r-highlight border-b-highlight'
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}

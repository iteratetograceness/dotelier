'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '../button'
import {
  DEFAULT_GRID_SETTINGS,
  GridSettings as GridSettingsType,
} from '@/app/swr/use-pixel-version'
import { cn } from '@/app/utils/classnames'

interface GridSettingsProps {
  settings: GridSettingsType
  gridSize: number
  onSettingsChange: (settings: GridSettingsType) => void
  onGridSizeChange: (size: number) => void
  disabled?: boolean
  /** When true, hides the colors slider (only applies to raster/PNG images) */
  isSvgMode?: boolean
}

export function GridSettingsPanel({
  settings,
  gridSize,
  onSettingsChange,
  onGridSizeChange,
  disabled = false,
  isSvgMode = false,
}: GridSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<GridSettingsType>(settings)
  const [localGridSize, setLocalGridSize] = useState(gridSize)
  const [gridSizeInput, setGridSizeInput] = useState(String(gridSize))
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    setLocalGridSize(gridSize)
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
          setLocalGridSize(parsed)
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
      setLocalGridSize(parsed)
      onGridSizeChange(parsed)
    } else {
      setGridSizeInput(String(localGridSize))
    }
  }, [gridSizeInput, localGridSize, onGridSizeChange])

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
          {/* Grid Size */}
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

          {/* Colors slider — only relevant for raster (PNG) images */}
          {!isSvgMode && (
            <div className='flex items-center gap-2'>
              <label className='text-xs text-shadow w-16 shrink-0'>Colors</label>
              <input
                type='range'
                min='2'
                max='64'
                value={localSettings.maxColors ?? 16}
                onChange={(e) => {
                  const newSettings = { ...localSettings, maxColors: parseInt(e.target.value) }
                  setLocalSettings(newSettings)
                  onSettingsChange(newSettings)
                }}
                className='flex-1 accent-accent'
                disabled={disabled}
              />
              <span className='text-xs w-8 text-right'>{localSettings.maxColors ?? 16}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

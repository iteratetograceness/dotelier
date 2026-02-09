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
  /** When true, hides settings that only apply to raster processing */
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

  const handleSettingChange = useCallback(
    <K extends keyof GridSettingsType>(key: K, value: GridSettingsType[K]) => {
      const newSettings = { ...localSettings, [key]: value }
      setLocalSettings(newSettings)
      onSettingsChange(newSettings)
    },
    [localSettings, onSettingsChange]
  )

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
          {isSvgMode && (
            <p className='text-xs text-shadow italic'>
              Some settings only apply before saving. Re-generate to access all options.
            </p>
          )}

          {/* Grid Size */}
          <div className='flex gap-2'>
            <div className='flex flex-col gap-0.5 flex-1'>
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

          {/* Sliders */}
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-shadow w-16 shrink-0'>Alpha</label>
              <input
                type='range'
                min='0'
                max='255'
                value={localSettings.alphaThreshold ?? 128}
                onChange={(e) => handleSettingChange('alphaThreshold', parseInt(e.target.value))}
                className='flex-1 accent-accent'
                disabled={disabled}
              />
              <span className='text-xs w-8 text-right'>{localSettings.alphaThreshold ?? 128}</span>
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-shadow w-16 shrink-0'>Fill %</label>
              <input
                type='range'
                min='0'
                max='100'
                value={localSettings.fillThreshold ?? 61}
                onChange={(e) => handleSettingChange('fillThreshold', parseInt(e.target.value))}
                className='flex-1 accent-accent'
                disabled={disabled}
              />
              <span className='text-xs w-8 text-right'>{localSettings.fillThreshold ?? 61}</span>
            </div>
            {!isSvgMode && (
              <div className='flex items-center gap-2'>
                <label className='text-xs text-shadow w-16 shrink-0'>Colors</label>
                <input
                  type='range'
                  min='2'
                  max='64'
                  value={localSettings.maxColors ?? 16}
                  onChange={(e) => handleSettingChange('maxColors', parseInt(e.target.value))}
                  className='flex-1 accent-accent'
                  disabled={disabled}
                />
                <span className='text-xs w-8 text-right'>{localSettings.maxColors ?? 16}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { Popover } from 'radix-ui'
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
  /** When true, hides settings that only apply to PNG processing (unfake) */
  isSvgMode?: boolean
}

const DOWNSCALE_METHODS = [
  { value: 'dominant', label: 'Dominant Color' },
  { value: 'median', label: 'Median' },
  { value: 'mode', label: 'Mode' },
  { value: 'mean', label: 'Mean' },
  { value: 'nearest', label: 'Nearest' },
] as const

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

  // Sync local state when props change
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
        // Debounce the actual change to avoid too many re-renders
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
    // Clear any pending debounce and apply immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    const parsed = parseInt(gridSizeInput)
    if (!isNaN(parsed) && parsed >= 8 && parsed <= 128) {
      setLocalGridSize(parsed)
      onGridSizeChange(parsed)
    } else {
      // Reset to current value if invalid
      setGridSizeInput(String(localGridSize))
    }
  }, [gridSizeInput, localGridSize, onGridSizeChange])

  const handleCleanupChange = useCallback(
    (key: 'morph' | 'jaggy', value: boolean) => {
      const newCleanup = { ...localSettings.cleanup, [key]: value }
      handleSettingChange('cleanup', newCleanup)
    },
    [localSettings.cleanup, handleSettingChange]
  )

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

          {/* Row 1: Grid Size + Downscale Method (Method hidden in SVG mode) */}
          <div className='flex gap-2'>
            <div className={cn('flex flex-col gap-0.5', isSvgMode ? 'flex-1' : 'flex-1')}>
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
            {!isSvgMode && (
              <div className='flex flex-col gap-0.5 flex-[2]'>
                <label className='text-xs text-shadow'>Method</label>
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button className='text-xs! w-full py-1!' disabled={disabled}>
                      {DOWNSCALE_METHODS.find((m) => m.value === localSettings.downscaleMethod)?.label ||
                        'Dominant'}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className='flex flex-col w-36 text-xs z-50'
                      align='start'
                      side='bottom'
                    >
                      {DOWNSCALE_METHODS.map((method) => (
                        <Button
                          key={method.value}
                          onClick={() => handleSettingChange('downscaleMethod', method.value)}
                          className='w-full'
                          isPressed={localSettings.downscaleMethod === method.value}
                        >
                          {method.label}
                        </Button>
                      ))}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            )}
          </div>

          {/* Row 2: Sliders (Colors hidden in SVG mode) */}
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
                  value={localSettings.maxColors ?? 32}
                  onChange={(e) => handleSettingChange('maxColors', parseInt(e.target.value))}
                  className='flex-1 accent-accent'
                  disabled={disabled}
                />
                <span className='text-xs w-8 text-right'>{localSettings.maxColors ?? 32}</span>
              </div>
            )}
          </div>

          {/* Row 3: Checkboxes - all unfake-only, hidden in SVG mode */}
          {!isSvgMode && (
            <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs'>
              <label className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  checked={localSettings.cleanup?.jaggy ?? true}
                  onChange={(e) => handleCleanupChange('jaggy', e.target.checked)}
                  className='accent-accent'
                  disabled={disabled}
                />
                Jaggy
              </label>
              <label className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  checked={localSettings.cleanup?.morph ?? false}
                  onChange={(e) => handleCleanupChange('morph', e.target.checked)}
                  className='accent-accent'
                  disabled={disabled}
                />
                Morph
              </label>
              <label className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  checked={localSettings.snapGrid ?? true}
                  onChange={(e) => handleSettingChange('snapGrid', e.target.checked)}
                  className='accent-accent'
                  disabled={disabled}
                />
                Snap
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

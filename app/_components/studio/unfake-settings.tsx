'use client'

import {
  DEFAULT_UNFAKE_SETTINGS,
  type UnfakeSettings,
} from '@/lib/unfake/types'
import { cn } from '@/app/utils/classnames'
import { Collapsible, Popover } from 'radix-ui'
import Image from 'next/image'
import { memo, useCallback, useState } from 'react'
import { Button } from '../button'
import { GrooveDivider } from './divider'

interface UnfakeSettingsPanelProps {
  settings: UnfakeSettings
  onChange: (settings: UnfakeSettings) => void
  onReprocess: () => void
  disabled?: boolean
  isProcessing?: boolean
}

const DOWNSCALE_METHODS = [
  { value: 'dominant', label: 'Dominant' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'median', label: 'Median' },
  { value: 'mean', label: 'Mean' },
  { value: 'content-adaptive', label: 'Content Adaptive' },
] as const

const DETECT_METHODS = [
  { value: 'auto', label: 'Auto' },
  { value: 'runs', label: 'Runs' },
  { value: 'edge', label: 'Edge' },
] as const

const EDGE_METHODS = [
  { value: 'tiled', label: 'Tiled' },
  { value: 'legacy', label: 'Legacy' },
] as const

export const UnfakeSettingsPanel = memo(function UnfakeSettingsPanel({
  settings,
  onChange,
  onReprocess,
  disabled = false,
  isProcessing = false,
}: UnfakeSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateSetting = useCallback(
    <K extends keyof UnfakeSettings>(key: K, value: UnfakeSettings[K]) => {
      onChange({ ...settings, [key]: value })
    },
    [settings, onChange]
  )

  const resetToDefaults = useCallback(() => {
    onChange(DEFAULT_UNFAKE_SETTINGS)
  }, [onChange])

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className='flex gap-1'>
        <Collapsible.Trigger asChild>
          <Button
            className='flex-1 text-xs'
            disabled={disabled}
            isPressed={isOpen}
          >
            {isOpen ? 'Hide Settings' : 'Image Settings'}
          </Button>
        </Collapsible.Trigger>
        <Button
          className='text-xs'
          onClick={onReprocess}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Reprocess'}
        </Button>
      </div>

      <Collapsible.Content className='mt-2'>
        <div className='flex flex-col gap-2 p-2 border-3 border-white border-r-shadow border-b-shadow text-xs'>
          {/* Color Settings */}
          <SettingsSection title='Colors'>
            <SettingsRow label='Max Colors'>
              <NumberInput
                value={settings.maxColors}
                onChange={(v) => updateSetting('maxColors', v)}
                min={2}
                max={64}
                disabled={disabled || settings.autoColorCount}
              />
            </SettingsRow>
            <SettingsRow label='Auto-detect'>
              <Checkbox
                checked={settings.autoColorCount}
                onChange={(v) => updateSetting('autoColorCount', v)}
                disabled={disabled}
              />
            </SettingsRow>
          </SettingsSection>

          <GrooveDivider className='w-full' />

          {/* Scale Detection */}
          <SettingsSection title='Scale Detection'>
            <SettingsRow label='Method'>
              <Select
                value={settings.detectMethod}
                options={DETECT_METHODS}
                onChange={(v) =>
                  updateSetting('detectMethod', v as UnfakeSettings['detectMethod'])
                }
                disabled={disabled}
              />
            </SettingsRow>
            {settings.detectMethod === 'edge' && (
              <SettingsRow label='Edge Type'>
                <Select
                  value={settings.edgeDetectMethod}
                  options={EDGE_METHODS}
                  onChange={(v) =>
                    updateSetting('edgeDetectMethod', v as UnfakeSettings['edgeDetectMethod'])
                  }
                  disabled={disabled}
                />
              </SettingsRow>
            )}
            <SettingsRow label='Manual Scale'>
              <div className='flex items-center gap-1'>
                <Checkbox
                  checked={settings.manualScale !== null}
                  onChange={(checked) =>
                    updateSetting('manualScale', checked ? 4 : null)
                  }
                  disabled={disabled}
                />
                {settings.manualScale !== null && (
                  <NumberInput
                    value={settings.manualScale}
                    onChange={(v) => updateSetting('manualScale', v)}
                    min={1}
                    max={32}
                    disabled={disabled}
                  />
                )}
              </div>
            </SettingsRow>
          </SettingsSection>

          <GrooveDivider className='w-full' />

          {/* Downscaling */}
          <SettingsSection title='Downscaling'>
            <SettingsRow label='Method'>
              <Select
                value={settings.downscaleMethod}
                options={DOWNSCALE_METHODS}
                onChange={(v) =>
                  updateSetting('downscaleMethod', v as UnfakeSettings['downscaleMethod'])
                }
                disabled={disabled}
              />
            </SettingsRow>
            {settings.downscaleMethod === 'dominant' && (
              <SettingsRow label='Threshold'>
                <NumberInput
                  value={settings.domMeanThreshold}
                  onChange={(v) => updateSetting('domMeanThreshold', v)}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  disabled={disabled}
                />
              </SettingsRow>
            )}
            <SettingsRow label='Snap to Grid'>
              <Checkbox
                checked={settings.snapGrid}
                onChange={(v) => updateSetting('snapGrid', v)}
                disabled={disabled}
              />
            </SettingsRow>
          </SettingsSection>

          <GrooveDivider className='w-full' />

          {/* Cleanup */}
          <SettingsSection title='Cleanup'>
            <SettingsRow label='Morphological'>
              <Checkbox
                checked={settings.morphCleanup}
                onChange={(v) => updateSetting('morphCleanup', v)}
                disabled={disabled}
              />
            </SettingsRow>
            <SettingsRow label='Jaggy'>
              <Checkbox
                checked={settings.jaggyCleanup}
                onChange={(v) => updateSetting('jaggyCleanup', v)}
                disabled={disabled}
              />
            </SettingsRow>
          </SettingsSection>

          <GrooveDivider className='w-full' />

          {/* Alpha */}
          <SettingsSection title='Alpha'>
            <SettingsRow label='Threshold'>
              <NumberInput
                value={settings.alphaThreshold}
                onChange={(v) => updateSetting('alphaThreshold', v)}
                min={0}
                max={255}
                disabled={disabled}
              />
            </SettingsRow>
          </SettingsSection>

          <GrooveDivider className='w-full' />

          <Button
            className='w-full text-xs'
            onClick={resetToDefaults}
            disabled={disabled}
          >
            Reset to Defaults
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
})

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='font-bold text-shadow'>{title}</span>
      {children}
    </div>
  )
}

function SettingsRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <span className='text-medium'>{label}</span>
      {children}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
}) {
  return (
    <input
      type='number'
      value={value}
      onChange={(e) => {
        const v = parseFloat(e.target.value)
        if (!isNaN(v) && v >= min && v <= max) {
          onChange(v)
        }
      }}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'w-16 px-1 py-0.5 text-xs text-center',
        'bg-accent text-background',
        'border-2 border-shadow',
        'focus:outline-none focus:border-highlight',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
  )
}

function Checkbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type='button'
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'size-5 flex items-center justify-center',
        'border-2 border-shadow bg-accent',
        'focus:outline-none focus:border-highlight',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {checked && (
        <span className='text-background text-xs font-bold'>✓</span>
      )}
    </button>
  )
}

function Select<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  disabled?: boolean
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          disabled={disabled}
          className={cn(
            'px-2 py-0.5 text-xs min-w-20',
            'bg-accent text-background',
            'border-2 border-shadow',
            'flex items-center justify-between gap-1',
            'focus:outline-none focus:border-highlight',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>{options.find((o) => o.value === value)?.label}</span>
          <span className='text-[8px]'>▼</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='flex flex-col bg-background border-2 border-shadow z-50'
          align='end'
          sideOffset={2}
        >
          {options.map((option) => (
            <Popover.Close key={option.value} asChild>
              <button
                type='button'
                onClick={() => onChange(option.value)}
                className={cn(
                  'px-2 py-1 text-xs text-left',
                  'hover:bg-hover',
                  value === option.value && 'bg-accent text-background'
                )}
              >
                {option.label}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

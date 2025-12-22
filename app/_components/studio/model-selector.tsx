'use client'

import type { ModelType } from '@/app/pixel-api/types'
import { cn } from '@/app/utils/classnames'
import { Popover } from 'radix-ui'
import { memo, useState } from 'react'

function InfoIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-3.5 rounded-full bg-background flex items-center justify-center text-[12px] font-bold text-foreground',
        className
      )}
    >
      ?
    </div>
  )
}

const MODEL_OPTIONS: {
  value: ModelType
  label: string
  description: string
}[] = [
  {
    value: 'flux',
    label: 'DEFAULT',
    description: 'Custom fine-tuned Flux.1 [dev] model',
  },
  {
    value: 'gemini',
    label: 'NANO BANANA',
    description: 'Gemini 3 Pro Image Preview model',
  },
]

interface ModelSelectorProps {
  value: ModelType
  onChange: (model: ModelType) => void
  disabled?: boolean
  className?: string
}

function ModelSelectorBase({
  value,
  onChange,
  disabled,
  className,
}: ModelSelectorProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const selectedModel = MODEL_OPTIONS.find((m) => m.value === value)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className='text-background'>Model</span>
      <Popover.Root open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <Popover.Trigger asChild>
          <button
            type='button'
            className='text-background opacity-70 hover:opacity-100 cursor-help'
            onMouseEnter={() => setIsInfoOpen(true)}
            onMouseLeave={() => setIsInfoOpen(false)}
          >
            <InfoIcon />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className='bg-foreground text-background text-xs p-2 max-w-48 z-50'
            side='top'
            sideOffset={4}
            onMouseEnter={() => setIsInfoOpen(true)}
            onMouseLeave={() => setIsInfoOpen(false)}
          >
            <div className='flex flex-col gap-1.5'>
              {MODEL_OPTIONS.map((option) => (
                <div key={option.value}>
                  <span className='font-bold'>{option.label}:</span>{' '}
                  {option.description}
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelType)}
        disabled={disabled}
        className={cn(
          'bg-shadow text-background text-xs px-2 py-0.5',
          'border border-foreground',
          'focus:outline-hidden focus:ring-1 focus:ring-background',
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {MODEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export const ModelSelector = memo(ModelSelectorBase)

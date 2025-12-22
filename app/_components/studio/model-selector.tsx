'use client'

import type { ModelType } from '@/app/pixel-api/types'
import { cn } from '@/app/utils/classnames'
import { memo } from 'react'

const MODEL_OPTIONS: { value: ModelType; label: string }[] = [
  { value: 'flux', label: 'FLUX' },
  { value: 'gemini', label: 'Gemini' },
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
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className='text-xs text-background opacity-70'>model:</span>
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

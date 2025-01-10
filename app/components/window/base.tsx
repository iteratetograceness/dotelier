import X from '@/app/icons/x'
import { cn } from '@/app/utils/classnames'
import { HTMLAttributes } from 'react'

const variants = {
  default: {
    background: 'bg-background',
    border: 'border-background',
    accent: 'bg-foreground',
    accentText: 'text-background',
    text: 'text-foreground',
  },
  secondary: {
    background: 'bg-foreground',
    border: 'border-foreground',
    accent: 'bg-background',
    accentText: 'text-foreground',
    text: 'text-background',
  },
}

export interface BaseWindowProps {
  variant?: keyof typeof variants
  title?: string
  children: React.ReactNode
  className?: string
  headerProps?: HTMLAttributes<HTMLDivElement>
  onClose?: () => void
  ref?: React.Ref<HTMLDivElement>
  handleRef?: React.Ref<HTMLDivElement>
}

export function BaseWindow({
  children,
  variant = 'default',
  className,
  title,
  headerProps,
  onClose,
  ref,
  handleRef,
  ...props
}: BaseWindowProps & HTMLAttributes<HTMLDivElement>) {
  const { background, border, accent, accentText, text } = variants[variant]

  return (
    <div
      className={cn(
        'flex flex-col border-[3px] p-1 pt-0',
        border,
        accent,
        accentText,
        className
      )}
      ref={ref}
      {...props}
    >
      <div
        className='flex items-center justify-between w-full h-7 px-1 pt-1'
        {...headerProps}
        ref={handleRef}
      >
        <span className='text-xl font-normal flex-1 select-none'>{title}</span>
        {onClose && (
          <button
            aria-label='Close Window'
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X />
          </button>
        )}
      </div>
      <div className={cn('p-4 flex-1', text, background)}>{children}</div>
    </div>
  )
}

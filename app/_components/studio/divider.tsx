import { cn } from '@/app/utils/classnames'

interface GrooveDividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function GrooveDivider({
  className,
  orientation = 'horizontal',
}: GrooveDividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex', className)}>
        <div className='w-px bg-shadow' />
        <div className='w-px bg-highlight' />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='h-px bg-shadow' />
      <div className='h-px bg-highlight' />
    </div>
  )
}

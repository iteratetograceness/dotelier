import { cn } from '@/app/utils/classnames'
import { BUTTON_HEIGHT } from './button'

const VARIANTS = {
  vertical: `w-[2px] h-[${
    BUTTON_HEIGHT - 4
  }px] after:block after:absolute after:top-0 after:left-[1px] after:w-[2px] after:bg-highlight after:h-full`,
  horizontal:
    'w-full h-[2px] after:block after:absolute after:top-[1px] after:left-0 after:w-full after:h-[1px] after:bg-highlight',
}

export function Divider({
  className,
  variant = 'vertical',
}: {
  className?: string
  variant?: keyof typeof VARIANTS
}) {
  return (
    <div
      className={cn(
        'relative bg-medium dark:bg-shadow',
        VARIANTS[variant],
        className
      )}
    />
  )
}

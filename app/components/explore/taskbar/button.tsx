import { cn } from '@/app/utils/classnames'
import { Button, ButtonProps } from '../../button'

export const BUTTON_HEIGHT = 38

export function TaskbarButton({ children, className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn('bg-hover', `h-[${BUTTON_HEIGHT}px]`, className)}
      {...props}
    >
      {children}
    </Button>
  )
}

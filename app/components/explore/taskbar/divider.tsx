import { cn } from '@/app/utils/classnames'
import { BUTTON_HEIGHT } from './button'

export function Divider() {
  return (
    <div
      className={cn(
        'relative bg-medium dark:bg-shadow w-[2px]',
        `h-[${BUTTON_HEIGHT - 4}px]`,
        `after:block after:absolute after:top-0 after:left-[1px] after:w-[2px] after:bg-highlight after:h-full`
      )}
    />
  )
}

import { cn } from '../utils/classnames'

const variants = {
  'light-gray': 'bg-light-shadow text-white pixel-border-light-shadow',
  dark: 'bg-accent text-white pixel-border-accent',
}

export function Pill({
  children,
  className,
  variant = 'light-gray',
}: {
  children: React.ReactNode
  variant?: keyof typeof variants
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-fit pl-2 pr-1.5 pixel-corners',
        variants[variant],
        className
      )}
    >
      <span>{children}</span>
    </div>
  )
}

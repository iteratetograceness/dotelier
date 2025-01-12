import { cn } from '../utils/classnames'

const variants = {
  primary: 'bg-background text-foreground hover:bg-hover',
  secondary: 'bg-foreground text-background hover:bg-hover',
} as const

const base = `px-4 py-1 w-fit border border-r-shadow border-b-shadow border-highlight`

const animation = `
  active:border-shadow
  active:border-r-highlight
  active:border-b-highlight
  transition-[border-color]
  duration-75
`

const pressed = `
  border-shadow
  !border-r-highlight
  !border-b-highlight
  transition-[border-color]
  duration-75
  !bg-hover
`

const disabled = `
  !bg-hover
  cursor-not-allowed
  text-medium
  dark:[text-shadow:_1px_1px_0_var(--highlight)]
  [text-shadow:_1px_1px_0_var(--background)]
`

export type ButtonProps = {
  children?: React.ReactNode
  className?: string
  variant?: keyof typeof variants
  isPressed?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className,
  variant = 'primary',
  isPressed = false,
  ...props
}: ButtonProps) {
  const { disabled: isDisabled } = props
  return (
    <button
      className={cn(
        variants[variant],
        base,
        !isDisabled && animation,
        !isDisabled && isPressed && pressed,
        isDisabled && disabled,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

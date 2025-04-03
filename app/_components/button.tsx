import Link from 'next/link'
import { ComponentProps } from 'react'
import { cn } from '../utils/classnames'

const variants = {
  primary:
    'bg-background text-accent hover:bg-hover border-r-light-shadow border-b-light-shadow border-highlight [text-shadow:_1px_1px_0_var(--medium)]',
  dark: 'bg-accent text-medium hover:bg-dark-hover border-r-foreground border-b-foreground border-light-shadow [text-shadow:_1px_1px_0_var(--foreground)]',
} as const

const base = `px-4 py-1 w-fit border`

const icon = `!p-1.5 !aspect-square w-auto h-full flex items-center justify-center`

const animation = {
  primary: `
  active:border-light-shadow
  active:border-r-medium
  active:border-b-medium
  transition-[border-color]
  duration-75
`,
  dark: `
  active:border-foreground
  active:border-r-light-shadow
  active:border-b-light-shadow
  transition-[border-color]
  duration-75
`,
} as const

const pressed = {
  primary: `
  !border-light-shadow
  !border-r-highlight
  !border-b-highlight
  transition-[border-color]
  duration-75
  !bg-hover
  [background-image:linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.2)),linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.2))]
  [background-size:4px_4px]
    [background-position:0_0,2px_2px]
`,
  dark: `
  !border-foreground
  !border-r-light-shadow
  !border-b-light-shadow
  transition-[border-color]
  duration-75
  !bg-dark-hover
  [background-image:linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%,rgba(0,0,0,0.15)),linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.15)_75%,rgba(0,0,0,0.15))]
  [background-size:4px_4px]
  [background-position:0_0,2px_2px]
`,
} as const

const disabled = {
  primary: `
  !bg-hover
  cursor-not-allowed
  text-medium
  [text-shadow:_1px_1px_0_var(--white)]
`,
  dark: `
  !bg-dark-hover
  cursor-not-allowed
  !text-highlight
  [text-shadow:_1px_1px_0_var(--light-shadow)]
`,
} as const

interface BaseProps {
  children?: React.ReactNode
  className?: string
  variant?: keyof typeof variants
  isPressed?: boolean
  disabled?: boolean
  iconOnly?: boolean
}

export type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

export type ButtonLinkProps = BaseProps & ComponentProps<typeof Link>

export function Button({
  children,
  className,
  variant = 'primary',
  isPressed = false,
  disabled: isDisabled = false,
  iconOnly = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variants[variant],
        base,
        !isDisabled && animation[variant],
        !isDisabled && isPressed && pressed[variant],
        isDisabled && disabled[variant],
        iconOnly && icon,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  isPressed = false,
  href,
  ...props
}: ButtonLinkProps) {
  const isDisabled = props.disabled
  return (
    <Link
      href={href}
      className={cn(
        variants[variant],
        base,
        !isDisabled && animation,
        !isDisabled && isPressed && pressed,
        isDisabled && disabled,
        className
      )}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}

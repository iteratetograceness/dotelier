import Link from 'next/link'
import { cn } from '../utils/classnames'
import { ComponentProps } from 'react'

const variants = {
  primary:
    'bg-background text-foreground hover:bg-hover border-r-shadow border-b-shadow border-highlight',
  secondary:
    'bg-foreground text-background hover:bg-accent dark:border-accent dark:border-r-highlight dark:border-b-highlight border-r-shadow border-b-shadow border-medium',
} as const

const base = `px-4 py-1 w-fit border`

const icon = `!p-1 aspect-square shrink-0`

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
  disabled,
  iconOnly = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled
  return (
    <button
      className={cn(
        variants[variant],
        base,
        !isDisabled && animation,
        !isDisabled && isPressed && pressed,
        isDisabled && disabled,
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

const variants = {
  primary:
    'bg-background text-foreground hover:bg-[#E6E6E6] dark:hover:bg-[#1D1D1D]',
  secondary:
    'bg-foreground text-background hover:bg-[#1D1D1D] dark:hover:bg-[#E6E6E6]',
} as const

const animation = `
  border
  border-r-shadow
  border-b-shadow
  border-highlight
  active:border-shadow
  active:border-r-highlight
  active:border-b-highlight
  transition-[border-color]
  duration-75
`

const pressed = (variant: keyof typeof variants) => `
  border
  border-shadow
  border-r-highlight
  border-b-highlight
  transition-[border-color]
  duration-75
${
  variant === 'primary'
    ? 'bg-[#E6E6E6] dark:bg-[#1D1D1D]'
    : 'bg-[#1D1D1D] dark:bg-[#E6E6E6]'
}
`
export function Button({
  children,
  className,
  variant = 'primary',
  isPressed = false,
  ...props
}: {
  children?: React.ReactNode
  variant?: keyof typeof variants
  isPressed?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${
        variants[variant]
      } px-4 py-1 w-fit ${className} ${animation} ${
        isPressed ? pressed(variant) : ''
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

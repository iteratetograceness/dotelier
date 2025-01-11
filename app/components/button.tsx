const variants = {
  primary: 'bg-background text-foreground hover:bg-hover',
  secondary: 'bg-foreground text-background hover:bg-hover',
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

const pressed = `
  border-shadow
  !border-r-highlight
  !border-b-highlight
  transition-[border-color]
  duration-75
  !bg-hover
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
      } px-4 py-1 w-fit ${className} ${animation} ${isPressed ? pressed : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}

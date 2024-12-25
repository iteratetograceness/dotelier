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

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: {
  children: React.ReactNode
  variant?: keyof typeof variants
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${variants[variant]} px-4 py-1 w-fit ${className} ${animation}`}
      {...props}
    >
      {children}
    </button>
  )
}

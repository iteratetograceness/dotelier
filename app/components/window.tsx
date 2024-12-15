const VARIANTS = {
  default: {
    background: 'bg-background',
    border: 'border-background',
    accent: 'bg-foreground',
    accentText: 'text-background',
    text: 'text-foreground',
  },
  secondary: {
    background: 'bg-foreground',
    border: 'border-foreground',
    accent: 'bg-background',
    accentText: 'text-foreground',
    text: 'text-background',
  },
}

interface WindowProps {
  variant?: keyof typeof VARIANTS
  title?: string
  children: React.ReactNode
  button?: string
  onClick?: () => void
  className?: string
}

export function WindowCard({
  variant = 'default',
  title,
  children,
  className,
}: WindowProps) {
  const { background, border, accent, accentText, text } = VARIANTS[variant]

  return (
    <div
      className={`border-[3px] p-1 pt-0 ${border} ${accent} ${accentText} ${className}`}
    >
      <div className='flex items-center justify-between w-full h-7 px-1 pt-1'>
        <span className='text-xl font-normal'>{title}</span>
        <X />
      </div>

      <div className={`p-4 ${text} ${background}`}>{children}</div>
    </div>
  )
}

function X() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect x='2' y='2' width='2' height='2' fill='currentColor' />
      <rect x='12' y='2' width='2' height='2' fill='currentColor' />
      <rect x='4' y='4' width='2' height='2' fill='currentColor' />
      <rect x='10' y='4' width='2' height='2' fill='currentColor' />
      <rect x='6' y='6' width='4' height='4' fill='currentColor' />
      <rect x='4' y='10' width='2' height='2' fill='currentColor' />
      <rect x='10' y='10' width='2' height='2' fill='currentColor' />
      <rect x='2' y='12' width='2' height='2' fill='currentColor' />
      <rect x='12' y='12' width='2' height='2' fill='currentColor' />
    </svg>
  )
}

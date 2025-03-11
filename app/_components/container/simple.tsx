import { cn } from '@/app/utils/classnames'
import { PIXEL_BORDER } from '@/app/utils/constants'

const variants = {
  default: {
    inner: 'bg-foreground text-background',
    outer: 'bg-background',
    border: 'bg-foreground',
  },
  inverse: {
    inner: 'bg-background text-foreground',
    outer: 'bg-foreground',
    border: 'bg-background',
  },
}

export function SimpleContainer({
  children,
  classNameOuter,
  classNameInner,
  addBorder = false,
  variant = 'default',
}: {
  children: React.ReactNode
  classNameOuter?: string
  classNameInner?: string
  addBorder?: boolean
  variant?: 'default' | 'inverse'
}) {
  const { inner, outer, border } = variants[variant]
  return (
    <div className={cn(addBorder && `p-0.5 ${border} w-fit`)}>
      <div className={cn(outer, PIXEL_BORDER, 'p-0.5', classNameOuter)}>
        <div
          className={cn('p-2 size-full', inner, PIXEL_BORDER, classNameInner)}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

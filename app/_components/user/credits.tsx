import { cn } from '@/app/utils/classnames'
import Image from 'next/image'

export const Credits = ({
  credits,
  className,
}: {
  credits?: number
  className?: string
}) => {
  if (credits === undefined) return null

  return (
    <div
      className={cn(
        'flex gap-2 items-center bg-medium pixel-corners pixel-border-medium p-2 w-full',
        className
      )}
    >
      <Image src='/coin.svg' width={24} height={24} alt='Golden coin' />
      <p>
        {credits} Credit{credits === 0 ? '' : 's'}
      </p>
    </div>
  )
}

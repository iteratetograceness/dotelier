import { cn } from '@/app/utils/classnames'
import { Studio } from '.'

export function StudioSkeleton({ className }: { className?: string }) {
  return <Studio pixels={[]} className={className} />
}

export function CanvasSkeleton() {
  return (
    <div
      className={cn(
        'w-[calc(100vw-40px)]',
        'max-w-[700px] sm:h-[450px]',
        'p-4 bg-medium pixel-corners pixel-border-medium',
        'flex flex-col sm:flex-row h-full flex-1'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center',
          'border-[2px] border-shadow border-r-background border-b-background',
          'w-full h-auto sm:h-full sm:w-auto aspect-square bg-white'
        )}
      />
      <div className='min-h-36 sm:min-h-auto min-w-auto sm:min-w-36' />
    </div>
  )
}

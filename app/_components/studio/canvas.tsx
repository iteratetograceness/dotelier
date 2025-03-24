import { cn } from '@/app/utils/classnames'

export function Canvas() {
  return (
    <div
      className={cn(
        'w-full md:w-[700px] h-[450px] p-4 bg-medium pixel-corners pixel-border-medium'
      )}
    >
      <div className='flex items-center justify-center border-[2px] border-shadow border-r-background border-b-background h-full w-auto aspect-square bg-white'>
        Canvas
      </div>
    </div>
  )
}

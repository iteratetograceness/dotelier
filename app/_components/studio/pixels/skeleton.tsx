import { cn } from '@/app/utils/classnames'
import { Pill } from '../../pill'
import { sharedClasses } from '../constants'

export function CanvasSkeleton() {
  return (
    <div className={sharedClasses}>
      <div
        className={cn(
          'flex items-center justify-center ',
          'border-3 border-shadow border-r-background border-b-background',
          'w-full h-auto md:h-full md:w-auto aspect-square bg-white'
        )}
      />
      <div className='min-h-36 md:min-h-auto min-w-auto md:min-w-36 flex flex-col gap-3 select-none'>
        <div className='flex gap-1 text-xs'>
          <Pill className='flex-1 truncate whitespace-nowrap' variant='dark'>
            ***
          </Pill>
          <Pill className='w-fit'>**/**/****</Pill>
        </div>

        <div className='flex flex-col w-full p-2 border-3 border-white border-r-shadow border-b-shadow h-[142px]' />
      </div>
    </div>
  )
}

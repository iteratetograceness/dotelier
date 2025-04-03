import { cn } from '@/app/utils/classnames'
import Image from 'next/image'
import { Studio } from '.'
import { Button } from '../button'
import { Pill } from '../pill'
import { sharedClasses } from './constants'
import { DownloadButton } from './download-button'

export function StudioSkeleton({ className }: { className?: string }) {
  return <Studio pixels={[]} className={className} />
}

export function CanvasSkeleton() {
  return (
    <div className={sharedClasses}>
      <div
        className={cn(
          'flex items-center justify-center ',
          'border-[2px] border-shadow border-r-background border-b-background',
          'w-full h-auto md:h-full md:w-auto aspect-square bg-white'
        )}
      />
      <div className='min-h-36 md:min-h-auto min-w-auto md:min-w-36 flex flex-col gap-3'>
        <div className='flex gap-1 text-xs'>
          <Pill className='flex-1 truncate whitespace-nowrap' variant='dark'>
            ***
          </Pill>
          <Pill className='w-fit'>**/**/****</Pill>
        </div>

        <div className='flex flex-col w-full p-2 border border-white border-r-shadow border-b-shadow h-fit'>
          <div className='flex flex-wrap md:max-w-[333px]'>
            <div
              className='size-10 border-[2px] border-shadow border-r-background border-b-background'
              style={{
                backgroundColor: `rgba(0, 0, 0, 1)`,
              }}
            />
            <Button aria-label='Pen Tool' className='!h-10' iconOnly>
              <Image
                src='/editor/pen.png'
                alt='Pen Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button aria-label='Fill Tool' iconOnly className='!h-10'>
              <Image
                src='/editor/fill.png'
                alt='Fill Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button aria-label='Eraser Tool' iconOnly className='!h-10'>
              <Image
                src='/editor/eraser.png'
                alt='Eraser Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button aria-label='Line Tool' iconOnly className='!h-10'>
              <Image
                src='/editor/line.png'
                alt='Line Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button aria-label='Toggle Grid' iconOnly className='!h-10'>
              <Image src='/editor/grid.png' alt='Grid' width={25} height={25} />
            </Button>
            <Button aria-label='Undo' iconOnly className='!h-10'>
              <Image
                src='/editor/arrow-left.png'
                alt='Undo'
                width={25}
                height={25}
              />
            </Button>
            <Button aria-label='Redo' iconOnly className='!h-10'>
              <Image
                src='/editor/arrow-right.png'
                alt='Redo'
                width={25}
                height={25}
              />
            </Button>
            <Button iconOnly className='!h-10' aria-label='Clear'>
              <Image
                src='/editor/trash.png'
                alt='Clear'
                width={25}
                height={25}
              />
            </Button>
            <DownloadButton iconOnly className='!h-10' />
            <Button aria-label='Save' iconOnly className='!h-10'>
              <Image src='/editor/save.png' alt='Save' width={25} height={25} />
            </Button>
            <Button aria-label='Reset' className='w-20 !px-1 !h-10'>
              <span>reload</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

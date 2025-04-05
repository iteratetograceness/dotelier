'use client'
import Easel from '@/app/icons/easel'
import { cn } from '@/app/utils/classnames'
import { memo, useMemo } from 'react'
import { Button } from '../button'
import { Pill } from '../pill'
import { sharedClasses } from './constants'
import { DownloadButton } from './download-button'
import { NewPixelInput } from './input'
import { useNewCanvas } from './use-new-canvas'

function NewCanvasInner() {
  return (
    <div className='flex flex-col items-center justify-center gap-16'>
      <div id='new-canvas' className={sharedClasses}>
        {/* Blank Canvas */}
        <div
          className={cn(
            'flex items-center justify-center',
            'border-[2px] border-shadow border-r-background border-b-background',
            'w-full h-auto md:h-full md:w-auto aspect-square bg-white'
          )}
        >
          <EmptyState />
        </div>
        {/* Controls */}
        <NewCanvasControls />
      </div>
      <NewPixelInput />
    </div>
  )
}

export const NewCanvas = memo(NewCanvasInner)

function NewCanvasControls() {
  const { status } = useNewCanvas()
  const isCompleted = useMemo(() => status === 'completed', [status])

  return (
    <div className='flex flex-col gap-3'>
      {/* Status */}
      <div className='flex gap-1 items-center'>
        <Pill variant='dark'>status</Pill>
        <Pill>{status}</Pill>
      </div>
      {/* Actions */}
      <div className='flex gap-2'>
        <DownloadButton disabled={!isCompleted} className='flex-1' />
        <Button className='flex-1' disabled={!isCompleted}>
          edit
        </Button>
      </div>
    </div>
  )
}

// New Output component, memoized: empty, loading, error, success
function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center size-full aspect-square'>
      <div className='flex items-center justify-center'>
        <Easel width={120} height={120} />
      </div>
      <p className='text-center text-light-shadow text-xs w-full leading-4'>
        It&apos;s so fine and yet
        <br />
        so terrible to stand
        <br />
        in front of a blank canvas.
        <br />
        <span className='text-shadow leading-7'>Paul Cezanne</span>
      </p>
    </div>
  )
}

'use client'

import Easel from '@/app/icons/easel'
import { cn } from '@/app/utils/classnames'
import { usePostProcessingStatus } from '@/app/utils/use-post-processing-status'
import Image from 'next/image'
import { memo } from 'react'
import { Button } from '../button'
import RetroLoader from '../loader'
import { Pill } from '../pill'
import { sharedClasses } from './constants'
import { DownloadButton } from './download-button'
import { NewPixelInput } from './input'
import { useNewCanvas } from './use-new-canvas'

function NewCanvasInner() {
  return (
    <div className='flex flex-col items-center justify-center gap-16'>
      <div id='new-canvas' className={sharedClasses}>
        {/* Canvas */}
        <div
          className={cn(
            'flex items-center justify-center relative',
            'border-[2px] border-shadow border-r-background border-b-background',
            'w-full h-auto md:h-full md:w-auto aspect-square bg-white'
          )}
        >
          <Output />
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
  const { status, prompt, result, id, setStatus } = useNewCanvas()
  usePostProcessingStatus({ id, onChange: setStatus })

  return (
    <div className='flex flex-col gap-3 justify-between'>
      {/* Status */}
      <div className='flex gap-1 items-center text-xs'>
        <Pill variant='dark'>status</Pill>
        <Pill>{status}</Pill>
      </div>

      <div className='flex flex-col min-h-20 md:flex-1 text-xs w-full bg-white px-3 py-2 gap-2'>
        <div className='flex flex-col'>
          <p className='font-bold text-lg inline-flex gap-1'>
            <span className='overflow-hidden text-ellipsis'>
              {status === 'idle' ? 'Untitled' : prompt}
            </span>
            <span>({new Date().getFullYear()})</span>
          </p>
          <p>pixels on digital matrix</p>
        </div>
        <div className='flex flex-col gap'>
          {result && (
            <>
              <p>
                generated in
                {result
                  ? ` ${result.inference_time.toFixed(2)} seconds`
                  : ' [pending]'}
              </p>
              <p>for optimal experience, squint slightly</p>
            </>
          )}
          {status === 'idle' && <p>Enter a prompt to get started</p>}
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2 h-10'>
        <DownloadButton
          iconOnly
          disableSvg={status !== 'completed'}
          disablePng={result?.images[0] === undefined}
          onDownload={(as) => {
            if (as === 'png') {
              console.log(result?.images[0].url)
            } else if (as === 'svg') {
              console.log('svg download')
            }
          }}
        />
        <Button
          className='flex-1'
          disabled={status !== 'completed'}
          onClick={() => {
            // void revalidatePixelVersion(id)
            // move one slide over
          }}
        >
          edit
        </Button>
      </div>
    </div>
  )
}

function Output() {
  const { status } = useNewCanvas()

  switch (status) {
    case 'idle':
      return <EmptyState />
    case 'generating':
      return <Loading />
    case 'error':
      return <Error />
    case 'post-processing':
    case 'completed':
      return <Result />
    default:
      return null
  }
}

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

function Loading() {
  return (
    <div className='flex'>
      <RetroLoader
        className='text-foreground flex flex-col items-center justify-center gap-4'
        title='RUNNING DOTELIER.EXE...'
      />
    </div>
  )
}

function Error() {
  const { error } = useNewCanvas()

  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <div className='flex items-center flex-col gap-3'>
        <p className='text-lg text-dark-hover leading-4'>
          something went wrong:
        </p>
        <p className='text-sm bg-medium pixel-corners px-2 py-1 w-fit text-center mx-4'>
          {error || 'Unexpected error'}
        </p>
        <p className='text-xs text-shadow w-fit'>
          note: credits will not be deducted
        </p>
      </div>
    </div>
  )
}

function Result() {
  const { result } = useNewCanvas()

  if (!result) return null

  return (
    <Image
      className='object-contain'
      src={result.images[0].url || '/'}
      alt='pixelated icon'
      fill
      quality={100}
    />
  )
}

'use client'

import { ErrorCode, getError } from '@/lib/error'
import Image from 'next/image'
import { useActionState, useCallback } from 'react'
import { toast } from 'sonner'
import { JOBS_PAGE_SIZE } from '../db/supabase/constants'
import { Cooper } from '../icons/cooper'
import Easel from '../icons/easel'
import { Louie } from '../icons/louie'
import SadBunny from '../icons/sad-bunny'
import Star from '../icons/star'
import { useJobsInfinite } from '../swr/use-jobs'
import { cn } from '../utils/classnames'
import { Button, ButtonLink } from './button'
import { SimpleContainer } from './container/simple'
import { FormState, generateIcon } from './form-action'
import RetroLoader from './loader'
import { JobExplorer } from './tables/jobs'

export function PixelGenerator() {
  const { jobs, isLoading, mutate, pages, setPages } = useJobsInfinite()
  const [state, dispatch, isPending] = useActionState<FormState, FormData>(
    generateIcon,
    {
      image: undefined,
      error: undefined,
    }
  )
  const isEmpty = jobs?.[0]?.length === 0
  const isReachingEnd =
    isEmpty || (jobs && jobs[jobs.length - 1]?.length < JOBS_PAGE_SIZE)

  const resetForm = useCallback(() => {
    setColors(new Map())
  }, [])

  return (
    <main
      className={cn(
        'p-2 max-w-[1000px] mx-auto',
        'grid grid-cols-1 md:grid-cols-2 md:gap-16'
      )}
    >
      <div id='left' className='flex flex-col items-center justify-center'>
        {/* Input */}
        <div className='flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-24'>
          <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
            <div className='relative mt-20'>
              <Cooper
                className='absolute -top-[75px] left-0 -z-10'
                width={120}
                height={120}
              />
              <Louie
                className='absolute -top-[85px] left-[72px] -z-20'
                width={120}
                height={140}
              />
              <SimpleContainer
                classNameOuter=''
                classNameInner='z-10 px-3 text-center'
                addBorder
              >
                <p>create a pixel icon</p>
              </SimpleContainer>
            </div>
          </div>
          <form className='flex flex-col gap-2 mt-8'>
            <div className='flex gap-1'>
              <label className='flex flex-col gap-1' htmlFor='prompt'>
                <p className='text-xs bg-foreground text-background px-2 py-1 w-fit'>
                  prompt
                </p>
              </label>
              <span className='text-xs px-2 py-1 bg-medium w-fit'>
                Tip: It helps to specify any colors you want to see!
              </span>
            </div>
            <textarea
              className='w-full bg-foreground text-background px-3 py-2 focus:outline-none resize-y min-h-10 h-32 max-h-80 placeholder:text-background/75'
              id='prompt'
              name='prompt'
              placeholder='a lop-ear rabbit sonny angel'
              required
            />

            <div className='flex w-full gap-2'>
              <Button type='reset' onClick={resetForm}>
                clear
              </Button>
              <Button
                className='flex-1'
                disabled={isPending}
                formAction={dispatch}
              >
                start
              </Button>
            </div>
          </form>
        </div>

        {/* Jobs */}
        <div className='hidden md:flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-16 gap-2 min-h-[326px]'>
          <Star
            className='absolute -top-[70px] left-0'
            width={120}
            height={120}
          />
          <Star
            className='absolute -top-[70px] right-0'
            width={120}
            height={120}
          />
          <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
            <div className='relative mt-20'>
              <SimpleContainer
                classNameOuter=''
                classNameInner='z-10 px-3 text-center'
                addBorder
              >
                <p>latest work</p>
              </SimpleContainer>
            </div>
          </div>
          <div className='mt-8'>
            <JobExplorer
              rows={
                jobs?.flatMap((p) =>
                  p.map((job) => ({
                    id: job.id,
                    prompt: job.prompt,
                    status: job.status,
                    updated_at: job.updated_at ?? '',
                  }))
                ) ?? []
              }
              isEmpty={isEmpty}
              isLoading={isLoading}
            />
          </div>
          <div className='flex gap-2'>
            <ButtonLink className='flex-1 text-center' href='/atelier'>
              view all
            </ButtonLink>
            <Button
              className='flex-1'
              disabled={isLoading || isReachingEnd}
              onClick={() => setPages(pages + 1)}
            >
              {isLoading ? 'loading' : 'load more'}
            </Button>
          </div>
        </div>
      </div>

      <div id='right' className='flex flex-col items-center justify-center'>
        <div className='flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-16 gap-2 h-[400px]'>
          <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
            <div className='relative mt-20'>
              <SimpleContainer
                classNameOuter=''
                classNameInner='z-10 px-3 text-center'
                addBorder
              >
                <p>canvas</p>
              </SimpleContainer>
            </div>
          </div>
          <Output image={state.image} error={state.error} pending={isPending} />
        </div>
      </div>

      {/* <BaseWindow
        className='w-full aspect-square md:w-[400px]'
        title='output'
        id='output'
      >
        <Output image={state.image} error={state.error} pending={isPending} />
      </BaseWindow> */}
    </main>
  )
}

function Output({
  image,
  error,
  pending,
}: {
  image?: string
  error?: ErrorCode
  pending: boolean
}) {
  if (pending) return <Pending />
  if (image) return <PixelImage base64={image} />
  if (error) return <ErrorState error={error} />
  return <EmptyState />
}

function PixelImage({ base64 }: { base64: string }) {
  const onDownload = useCallback(async (imageData: string) => {
    try {
      const response = await fetch(imageData)

      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const blobWithType = new Blob([blob], { type: 'image/png' })
      const url = window.URL.createObjectURL(blobWithType)

      const link = document.createElement('a')
      link.href = url
      link.download = 'my-pixel-icon.png'

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch {
      toast.error('Failed to download image. Please try again.')
    }
  }, [])

  return (
    <div className='flex flex-col items-center flex-1 mt-10 h-full gap-4'>
      <div className='size-[250px] relative border-[2px] border-shadow border-r-highlight border-b-highlight'>
        <Image
          className='object-contain'
          src={`data:image/png;base64,${base64}`}
          alt='pixelated icon'
          fill
          quality={100}
        />
      </div>
      <div className='flex flex-col gap-2 w-full mt-auto'>
        <p className='text-sm bg-medium px-2 py-1 w-fit self-end'>
          {/* TODO */}
          duration: XXX
        </p>
        <Button
          className='flex-1 w-full'
          type='button'
          onClick={() => onDownload(`data:image/png;base64,${base64}`)}
        >
          Download SVG
        </Button>
      </div>
    </div>
  )
}

function Pending() {
  return (
    <div className='flex items-center flex-1 justify-center h-full'>
      <RetroLoader
        className='p-8 text-foreground flex flex-col items-center justify-center gap-4'
        title='RUNNING DOTELIER.EXE...'
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center flex-1 justify-center h-full'>
      <div className='flex items-center justify-center'>
        <Easel width={250} height={250} />
      </div>
      <p className='text-center text-sm max-w-[250px]'>
        "It's so fine and yet so terrible to stand in front of a blank canvas."
        <br />
        —Paul Cezanne
      </p>
    </div>
  )
}

function ErrorState({ error }: { error: ErrorCode }) {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <div className='text-foreground'>
        <SadBunny width={150} height={150} />
      </div>
      <div className='flex items-center flex-col gap-2'>
        <p className='text-xl font-bold'>something went wrong</p>
        <p className='text-sm bg-medium px-2 py-1 w-fit'>{getError(error)}</p>
      </div>
    </div>
  )
}

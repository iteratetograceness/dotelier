'use client'

import { Cooper } from '@/app/icons/cooper'
import { Louie } from '@/app/icons/louie'
import { cn } from '@/app/utils/classnames'
import { useSession } from '@/lib/auth/client'
import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { SignInButton } from '../auth/sign-in-button'
import { Button } from '../button'
import { useNewCanvas } from './use-new-canvas'

export function NewPixelInput({ className }: { className?: string }) {
  const { data: session, isPending: isSessionPending } = useSession()
  const { startGeneration, reset } = useNewCanvas()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      startTransition(async () => {
        const formData = new FormData(e.target as HTMLFormElement)
        const prompt = formData.get('prompt') as string
        formRef.current?.reset()
        await startGeneration(prompt)
      })
    },
    [startGeneration]
  )

  const disabled = isPending || !session

  return (
    <div
      className={cn(
        'flex flex-col py-2 min-w-[250px] w-full xs:max-w-[700px] relative',
        className
      )}
    >
      {/* You have N credits left, component */}

      {/* Pups */}
      <div className='absolute top-2 left-0'>
        <Cooper
          className='absolute -top-[60px] left-0 -z-10'
          width={100}
          height={100}
        />
        <Louie
          className='absolute -top-[60px] left-[50px] -z-20'
          width={100}
          height={100}
        />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-2.5 pixel-corners p-2 bg-black pixel-border-black'
        ref={formRef}
      >
        <textarea
          aria-label='Prompt to generate pixel icon'
          className='w-full bg-accent text-background px-3 py-2 focus:outline-hidden resize-y min-h-10 h-10 max-h-20 placeholder:text-shadow'
          id='prompt'
          name='prompt'
          placeholder='a weeping computer'
          required
        />
        <CTA
          mounted={mounted}
          session={!!session}
          isSessionPending={isSessionPending}
          disabled={disabled}
          onReset={reset}
        />
      </form>
    </div>
  )
}

function CTA({
  mounted,
  session,
  isSessionPending,
  disabled,
  onReset,
}: {
  mounted: boolean
  session: boolean
  isSessionPending: boolean
  disabled: boolean
  onReset: () => void
}) {
  if (!mounted || isSessionPending) {
    return <div className='flex w-full gap-2 justify-end h-[38px]' />
  }

  if (session) {
    return (
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}
          className='flex w-full gap-2 justify-end'
        >
          <Button
            disabled={disabled}
            type='reset'
            variant='dark'
            onClick={onReset}
          >
            clear
          </Button>
          <Button disabled={disabled}>create icon</Button>
        </m.div>
      </LazyMotion>
    )
  }

  return (
    <SignInButton
      className='w-full'
      text='sign in to create a pixel icon'
      variant='dark'
      type='button'
    />
  )
}

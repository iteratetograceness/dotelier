'use client'

import { useCredits } from '@/app/swr/use-credits'
import { cn } from '@/app/utils/classnames'
import { useSession } from '@/lib/auth/client'
import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { SignInButton } from '../auth/sign-in-button'
import { Button } from '../button'
import { Credits } from '../user/credits'
import { Pups } from './pups'
import { useNewCanvas } from './use-new-canvas'

function NewPixelInput({ className }: { className?: string }) {
  const { data: session, isPending: isSessionPending } = useSession()
  const { startGeneration, reset } = useNewCanvas()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [mounted, setMounted] = useState(false)
  const { credits, revalidateCredits } = useCredits()

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

        const optimisticCredits = credits ? credits - 1 : 0
        void revalidateCredits(optimisticCredits)
        await startGeneration(prompt)
      })
    },
    [startGeneration, credits, revalidateCredits]
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
      <Pups />

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-2.5 pixel-corners p-2 bg-black pixel-border-black relative z-10'
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
        <div className='flex items-center'>
          <Credits
            credits={credits}
            className='bg-transparent border-none text-background py-0'
          />
          <MemoizedCta
            mounted={mounted}
            session={!!session}
            isSessionPending={isSessionPending}
            disabled={disabled}
            onReset={reset}
          />
        </div>
      </form>
    </div>
  )
}

export const PixelInput = memo(NewPixelInput)

function Cta({
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
      text='sign in to create an icon'
      variant='dark'
      type='button'
    />
  )
}

const MemoizedCta = memo(Cta)

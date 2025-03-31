'use client'

import { Cooper } from '@/app/icons/cooper'
import { Louie } from '@/app/icons/louie'
import { cn } from '@/app/utils/classnames'
import { useSession } from '@/lib/auth/client'
import { AnimatePresence, motion } from 'motion/react'
import { memo, Suspense, useCallback, useMemo, useTransition } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { SignInButton } from '../auth/sign-in-button'
import { Button } from '../button'
import { useNewCanvas } from './use-new-canvas'

function NewPixelInputInner({ className }: { className?: string }) {
  const { data: session, isPending: isSessionPending } = useSession()
  const { setStatus, startGeneration, reset, active } = useNewCanvas()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      startTransition(() => {
        const formData = new FormData(e.target as HTMLFormElement)
        const prompt = formData.get('prompt') as string
        const id = formData.get('id') as string
        startGeneration(prompt, id)
        // Call the generatePixel server action
        // Update status?
      })
    },
    [startGeneration]
  )

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  const disabled = useMemo(() => isPending || !session, [isPending, session])

  return (
    <AnimatePresence>
      {!active || isSessionPending ? null : (
        <motion.div
          key='pixel-prompt'
          initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
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
          >
            <textarea
              aria-label='Prompt to generate pixel icon'
              className='w-full bg-accent text-background px-3 py-2 focus:outline-none resize-y min-h-10 h-10 max-h-20 placeholder:text-shadow'
              id='prompt'
              name='prompt'
              placeholder='a weeping computer'
              required={!!session}
            />
            <input type='hidden' name='id' value={uuidv4()} />
            <Suspense
              fallback={<div className='flex w-full gap-2 justify-end' />}
            >
              {session ? (
                <div className='flex w-full gap-2 justify-end'>
                  <Button
                    disabled={disabled}
                    type='reset'
                    variant='dark'
                    onClick={handleReset}
                  >
                    clear
                  </Button>
                  <Button disabled={disabled}>create icon</Button>
                </div>
              ) : (
                <SignInButton
                  className='w-full'
                  text='sign in to create a pixel icon'
                  variant='dark'
                  type='button'
                />
              )}
            </Suspense>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const NewPixelInput = memo(NewPixelInputInner)

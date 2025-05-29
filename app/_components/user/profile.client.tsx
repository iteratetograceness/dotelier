'use client'

import { signOut, useSession } from '@/lib/auth/client'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DropdownMenu } from 'radix-ui'
import { Button } from '../button'

export function UserProfile() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) return null

  return (
    <DropdownMenu.Root>
      <AnimatePresence>
        <DropdownMenu.Trigger asChild>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}
            className='size-10 flex flex-col items-center justify-center pixel-corners pixel-border-background shrink-0'
          >
            <Image
              src={session.user.image || '/placeholder.svg'}
              alt='user avatar'
              width={50}
              height={50}
            />
          </motion.button>
        </DropdownMenu.Trigger>
      </AnimatePresence>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          className='flex flex-col pixel-corners pixel-border-foreground bg-background p-4 z-100 w-56 gap-2'
        >
          <div className='flex flex-col'>
            <DropdownMenu.Label asChild>
              <p className='whitespace-nowrap truncate w-full text-lg leading-5'>
                {session.user.name}
              </p>
            </DropdownMenu.Label>
            <DropdownMenu.Label asChild>
              <p className='whitespace-nowrap truncate w-full text-xs text-light-shadow'>
                {session.user.email}
              </p>
            </DropdownMenu.Label>
          </div>
          <DropdownMenu.Item asChild textValue='Sign Out'>
            <Button
              className='w-full'
              onClick={() => {
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/')
                      router.refresh()
                    },
                  },
                })
              }}
            >
              Sign Out
            </Button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

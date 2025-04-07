'use client'

import { signOut, useSession } from '@/lib/auth/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { Button } from '../button'

export function UserProfile() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <DropdownMenu>
      <AnimatePresence>
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>
      </AnimatePresence>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align='end'
          className='flex flex-col pixel-corners pixel-border-foreground bg-background p-4 z-[100] w-56 gap-2'
        >
          <div className='flex flex-col'>
            <DropdownMenuLabel asChild>
              <p className='whitespace-nowrap truncate w-full text-lg leading-5'>
                {session.user.name}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuLabel asChild>
              <p className='whitespace-nowrap truncate w-full text-xs text-light-shadow'>
                {session.user.email}
              </p>
            </DropdownMenuLabel>
          </div>
          <DropdownMenuItem asChild textValue='Sign Out'>
            <Button
              className='w-full'
              onClick={() => {
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/'
                    },
                  },
                })
              }}
            >
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

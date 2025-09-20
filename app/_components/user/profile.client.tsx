'use client'

import { signOut } from '@/lib/auth/client'
import { NAV_LINKS } from '@/lib/constants'
import { User } from 'better-auth/*'
import { LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DropdownMenu } from 'radix-ui'
import { memo, use, useEffect, useState } from 'react'
import { Button, ButtonLink } from '../button'
import { Credits } from './credits'

function UserProfileInternal({
  user,
  creditsPromise,
}: {
  user: User
  creditsPromise: Promise<number>
}) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const credits = use(creditsPromise)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!user || !mounted) return null

  return (
    <DropdownMenu.Root modal={false}>
      <LazyMotion features={domAnimation}>
        <DropdownMenu.Trigger asChild className='cursor-pointer'>
          <m.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}
            className='size-10 flex flex-col items-center justify-center pixel-corners pixel-border-background shrink-0 select-none'
          >
            <Image
              src={user.image || '/placeholder.svg'}
              alt='user avatar'
              width={50}
              height={50}
            />
          </m.button>
        </DropdownMenu.Trigger>
      </LazyMotion>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          sideOffset={4}
          className='flex flex-col pixel-corners pixel-border-foreground bg-background p-4 z-100 w-56 gap-2'
        >
          <div className='flex flex-col'>
            <DropdownMenu.Label asChild>
              <p className='whitespace-nowrap truncate w-full text-lg leading-5'>
                {user.name}
              </p>
            </DropdownMenu.Label>
            <DropdownMenu.Label asChild>
              <p className='whitespace-nowrap truncate w-full text-xs text-light-shadow'>
                {user.email}
              </p>
            </DropdownMenu.Label>
          </div>
          <Credits credits={credits} />
          <DropdownMenu.Separator />
          {NAV_LINKS.map(({ label, href }) => (
            <DropdownMenu.Item asChild textValue={label} key={href}>
              <ButtonLink className='w-full' href={href}>
                {label}
              </ButtonLink>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Item asChild textValue='Sign Out'>
            <Button
              className='w-full text-left'
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

export const UserProfile = memo(UserProfileInternal)

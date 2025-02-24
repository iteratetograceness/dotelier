'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { TaskbarButton } from './button'
import Link from 'next/link'
import { Divider } from './divider'
import { logout, signIn } from '@/app/db/supabase/client-queries'
import { useUser } from '@/app/utils/use-user'

export default function StartMenu() {
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false)
  const { loading } = useUser()

  return (
    <Popover.Root open={isStartMenuOpen} onOpenChange={setIsStartMenuOpen}>
      <Popover.Trigger asChild disabled={loading}>
        <TaskbarButton
          className='w-fit !px-1.5 !pl-2'
          isPressed={isStartMenuOpen}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        >
          <span>Start</span>
        </TaskbarButton>
      </Popover.Trigger>
      <Popover.Content
        side='top'
        align='start'
        className='w-auto'
        sideOffset={9}
      >
        <Menu />
      </Popover.Content>
    </Popover.Root>
  )
}

function Menu() {
  return (
    <div className='flex bg-hover border-2 border-r-shadow border-b-shadow border-highlight w-64 p-0.5'>
      <div className='bg-shadow text-highlight px-1 py-2 flex items-end'>
        <span className='-rotate-180' style={{ writingMode: 'vertical-rl' }}>
          DOTELIER97
        </span>
      </div>
      <ul id='options' className='flex-1'>
        <MenuItem>
          {/* TODO: open finder dialog with search bar + filters */}
          <button
            className='w-full text-left disabled:opacity-75 cursor-not-allowed'
            disabled
            onClick={() => {}}
          >
            Finder (Coming Soon)
          </button>
        </MenuItem>
        <MenuItem>
          <Link className='flex w-full text-left' href='/atelier'>
            My icons
          </Link>
        </MenuItem>
        <MenuItem>
          <Link className='flex w-full text-left' href='/'>
            Home
          </Link>
        </MenuItem>
        <Divider variant='horizontal' />
        <MenuItem>
          <AuthButton />
        </MenuItem>
      </ul>
    </div>
  )
}
function MenuItem({ children }: { children: React.ReactNode }) {
  return (
    <li className='p-2 hover:bg-shadow hover:text-highlight flex-1'>
      {children}
    </li>
  )
}
function AuthButton() {
  const { user } = useUser()

  if (user) {
    return (
      <button className='w-full text-left' onClick={logout}>
        Logout
      </button>
    )
  }

  return (
    <button
      className='w-full text-left'
      onClick={() => signIn({ path: '/explore' })}
    >
      Sign in
    </button>
  )
}

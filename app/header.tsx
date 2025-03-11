'use client'

import { logout, signIn } from '@/app/db/supabase/client-queries'
import { useMemo } from 'react'
import { MenuBar } from './_components/menu-bar'
import { useUser } from './utils/use-user'

const MENU_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Explore',
    href: '/explore',
  },
]

export function Header() {
  const { user, loading } = useUser()

  const menuItems = useMemo(() => {
    if (loading) return MENU_ITEMS

    if (user) {
      return [
        ...MENU_ITEMS,
        {
          // Not happy with this naming
          label: 'Activity',
          href: '/activity',
        },
        {
          label: 'Sign Out',
          onClick: () => logout(),
        },
      ]
    }

    return [
      ...MENU_ITEMS,
      {
        label: 'Login',
        onClick: () => signIn({ path: '/' }),
      },
    ]
  }, [user, loading])

  return (
    <header className='flex flex-col items-center relative z-0'>
      <div className='w-full bg-foreground h-9 flex items-center justify-center'>
        <h1 className='text-white text-sm'>dotelier studio</h1>
      </div>

      <MenuBar config={menuItems} />
    </header>
  )
}

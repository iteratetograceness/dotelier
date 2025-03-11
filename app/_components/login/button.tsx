'use client'

import { logout, signIn } from '@/app/db/supabase/client-queries'
import { useUser } from '@/app/utils/use-user'
import { Button } from '../button'

export function LoginButton() {
  const { user, loading } = useUser()

  if (loading) return <Button className='text-sm !w-24 !h-[34px]' />

  return (
    <Button
      className='text-sm !w-24'
      onClick={() => {
        if (user) logout()
        else signIn({ path: '/' })
      }}
    >
      {user ? 'Sign Out' : 'Sign In'}
    </Button>
  )
}

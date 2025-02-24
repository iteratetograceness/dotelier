'use client'

import { useUser } from '@/app/utils/use-user'
import { logout, signIn } from '@/app/db/supabase/client-queries'
import { Button } from '../button'

export function LoginButton() {
  const { user, loading } = useUser()

  if (loading) return <Button className='text-sm !w-24' />

  return (
    <Button
      className='text-sm !w-24'
      onClick={() => {
        if (user) logout()
        else signIn({ path: '/explore' })
      }}
    >
      {user ? 'Sign Out' : 'Sign In'}
    </Button>
  )
}

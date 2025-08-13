'use client'

import { useSession } from '@/lib/auth/client'
import { PaginatedGrid } from './grid'
import { SignedOutState } from './signed-out-state'

export default function Studio() {
  const { data: session, isPending } = useSession()

  if (isPending) return null

  return (
    <div className='size-full flex items-center justify-center'>
      {session ? <PaginatedGrid /> : <SignedOutState />}
    </div>
  )
}

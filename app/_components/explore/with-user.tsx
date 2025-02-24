import { createClient } from '@/app/db/supabase/server'
import { Explorer } from '.'
import { redirect } from 'next/navigation'
import { IconGridSkeleton } from './grid/skeleton'
import { TaskbarSkeleton } from './taskbar'
import { ERROR_CODES } from '@/lib/error'

export async function ExplorerWithUser({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/?e=${ERROR_CODES.UNAUTHORIZED}`)
  }

  return <Explorer searchParams={searchParams} userId={user.id} />
}

export function ExplorerWithUserSkeleton() {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative border border-b-0 border-hover m-10 flex flex-col items-center justify-between dark:bg-[#333333] shadow-sm w-full min-w-[296px] min-h-[592px]'>
        <IconGridSkeleton />
        <TaskbarSkeleton />
      </div>
    </div>
  )
}

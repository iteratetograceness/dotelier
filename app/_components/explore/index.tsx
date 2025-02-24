import { Suspense } from 'react'
import { TaskbarSkeleton } from './taskbar'
import { IconGrid } from './grid'
import { Taskbar } from './taskbar'
import { IconGridSkeleton } from './grid/skeleton'

export function Explorer({
  searchParams,
  userId,
}: {
  searchParams: Promise<{ p: string | null }>
  userId?: string
}) {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative border border-b-0 border-hover m-10 flex flex-col items-center justify-between dark:bg-[#333333] shadow-sm w-full min-w-[296px] min-h-[592px]'>
        <Suspense fallback={<IconGridSkeleton />}>
          <IconGrid searchParams={searchParams} userId={userId} />
        </Suspense>
        <Suspense fallback={<TaskbarSkeleton />}>
          <Taskbar userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}

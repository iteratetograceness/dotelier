import { Suspense } from 'react'
import { IconGrid } from '../_components/explore/grid'
import { IconGridSkeleton } from '../_components/explore/grid/skeleton'
import { Taskbar, TaskbarSkeleton } from '../_components/explore/taskbar'

export default function Explore({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative border border-b-0 border-hover m-10 flex flex-col items-center justify-between dark:bg-[#333333] shadow-sm w-full min-w-[296px] min-h-[592px]'>
        <Suspense fallback={<IconGridSkeleton />}>
          <IconGrid searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TaskbarSkeleton />}>
          <Taskbar />
        </Suspense>
      </div>
    </div>
  )
}

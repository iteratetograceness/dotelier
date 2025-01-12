import { Suspense } from 'react'
import { IconGrid } from '../components/explore/grid'
import { IconGridSkeleton } from '../components/explore/grid/skeleton'
import { Taskbar, TaskbarSkeleton } from '../components/explore/taskbar'

export default function Explore() {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative border border-b-0 border-hover w-[90vw] h-[100vh] custom:h-auto custom:aspect-video m-10 flex flex-col justify-between dark:bg-[#333333] shadow-sm'>
        <Suspense fallback={<IconGridSkeleton />}>
          <IconGrid />
        </Suspense>
        <Suspense fallback={<TaskbarSkeleton />}>
          <Taskbar />
        </Suspense>
      </div>
    </div>
  )
}

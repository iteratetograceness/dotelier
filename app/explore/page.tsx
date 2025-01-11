import { Suspense } from 'react'
import { IconGrid } from '../components/explore/grid'
import Taskbar from '../components/explore/taskbar'
import { IconGridSkeleton } from '../components/explore/grid/skeleton'

export default function Explore() {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative border border-hover w-[90vw] h-[100vh] custom:h-auto custom:aspect-video m-10 flex flex-col justify-between dark:bg-[#333333]'>
        <Suspense fallback={<IconGridSkeleton />}>
          <IconGrid />
        </Suspense>
        <Taskbar />
      </div>
    </div>
  )
}

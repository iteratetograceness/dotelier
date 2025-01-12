import { cn } from '@/app/utils/classnames'
import { Time } from './time'
import StartMenu from './start-menu'
import { db } from '@/app/db/client'
import { Pages } from './pages'
import { getPageCount } from '@/app/db'
import { Divider } from './divider'

const highlight = `border-t-[1px] border-hover before:absolute before:top-0 before:w-full before:h-[1px] before:bg-highlight`

export async function Taskbar() {
  const count = await getPageCount(db)

  return (
    <div className={cn('h-[50px] select-none bg-hover relative', highlight)}>
      <div className='flex items-center justify-between h-full px-0.5'>
        <div className='flex items-center gap-1 h-full'>
          <StartMenu />
          <Divider />
          <Pages count={count} />
        </div>
        <Time />
      </div>
    </div>
  )
}

export function TaskbarSkeleton() {
  return (
    <div className={cn('h-[50px] select-none bg-hover', highlight)}>
      <div className='flex items-center justify-between h-full px-0.5'>
        <div className='flex items-center gap-2'>
          <StartMenu />
        </div>
        <Time />
      </div>
    </div>
  )
}

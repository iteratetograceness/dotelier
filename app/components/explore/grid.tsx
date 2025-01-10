'use client'

import { Icon, PublicIcon } from '@/app/components/explore/icon'
import { useState } from 'react'
import Taskbar from './taskbar'

/**
 * Need to add:
 * - Skeleton
 * - Pagination
 * - On double click: parallel route modal w/ more details
 * - Render in a "computer" screen
 */

export function IconGrid({ icons }: { icons: PublicIcon[] }) {
  const [active, setActive] = useState<string>()

  return (
    <div className='relative border border-foreground w-[90vw] h-[100vh] custom:h-auto custom:aspect-video m-10 flex flex-col justify-between'>
      <div className='grid grid-flow-col auto-cols-[70px] grid-rows-[repeat(auto-fill,96px)] size-full pt-6 px-4 overflow-y-auto'>
        {icons.map((icon) => (
          <Icon
            key={icon.id}
            icon={icon}
            active={active === icon.id}
            setActive={setActive}
          />
        ))}
      </div>
      <Taskbar />
    </div>
  )
}

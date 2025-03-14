'use client'

import { useDraggable } from '@neodrag/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/app/utils/classnames'
import { PARENT_ID } from './grid/client'
import { usePathname, useRouter } from 'next/navigation'
import { Pixel } from '@/app/db/supabase/types'
import { getPublicPixelAsset } from '@/app/db/supabase/storage'

const item = {
  hidden: {
    opacity: 0,
    filter: 'blur(5px)',
  },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.2,
    },
  },
}

export function Icon({
  icon,
  active,
  setActive,
}: {
  icon: Pick<Pixel, 'id' | 'file_path' | 'prompt'>
  active: boolean
  setActive: (id: number | undefined) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [lastTap, setLastTap] = useState(0)
  const [zIndex, setZIndex] = useState(1)

  const draggableRef = useRef<HTMLButtonElement>(null!)
  useDraggable(draggableRef, {
    bounds: `#${PARENT_ID}`,
    onDragStart: () => {
      setZIndex(10)
      setActive(icon.id)
    },
    onDragEnd: () => {
      setZIndex(1)
    },
  })

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.detail === 1) {
      setActive(icon.id)
      setZIndex(10)
    }
  }

  const handleDoubleClick = useCallback(() => {
    const basePathname = pathname.split('/').slice(0, 2).join('/')
    router.push(`${basePathname}/${icon.id}`)
  }, [icon.id, pathname, router])

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      handleDoubleClick()
    } else {
      handleClick(e)
    }

    setLastTap(now)
  }

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`[data-icon-id="${icon.id}"]`)) {
        setActive(undefined)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleDoubleClick()
      }

      if (e.key === 'Escape') {
        setActive(undefined)
      }

      if (e.key === 'Tab') {
        setActive(undefined)
      }
    }

    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleDoubleClick, icon.id, setActive])

  return (
    <motion.div
      key={icon.id}
      className='w-[70px] h-[96px]'
      variants={item}
      style={{
        transformOrigin: 'center center',
        zIndex,
      }}
    >
      <button
        data-icon-id={icon.id}
        className='text-foreground flex flex-col items-center justify-center h-[96px] w-[70px] p-2 gap-2 cursor-pointer mx-auto focus:outline-none group'
        aria-label={icon.prompt}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        ref={draggableRef}
      >
        <div
          className={cn(
            'relative',
            'group-focus:after:content-[" "] group-focus:after:absolute group-focus:after:inset-0 group-focus:after:bg-blue-900/50 group-focus:after:size-[50px] group-focus:after:border-[1px] group-focus:after:border-dotted group-focus:after:border-foreground group-focus:after:dark:bg-blue-300/50',
            active &&
              'after:content-[" "] after:absolute after:inset-0 after:bg-blue-900/50 after:size-[50px] after:border-[1px] after:border-dotted after:border-foreground'
          )}
        >
          <img
            className='select-none'
            src={getPublicPixelAsset(icon.file_path)}
            alt={icon.prompt}
          />
        </div>
        <p
          className={cn(
            'select-none text-sm w-fit max-w-full truncate text-center',
            'group-focus:bg-blue-900/50 group-focus:dark:bg-blue-300/50 group-focus:border-dotted group-focus:border-foreground border-[1px] border-transparent group-focus:text-white',
            active &&
              'bg-blue-900/50 border-dotted border-foreground text-white'
          )}
        >
          {icon.prompt}
        </p>
      </button>
    </motion.div>
  )
}

'use client'

import { PublicIcon } from '../explore/page'
import { useEffect, useState } from 'react'
import { cn } from '../utils/classnames'

/**
 * Need to add:
 * - Skeleton
 * - Pagination
 * - On double click: parallel route modal w/ more details
 * - Swap flex for grid
 * - Render in a "computer" screen
 */

export function IconGrid({ icons }: { icons: PublicIcon[] }) {
  return (
    <div className='flex flex-wrap gap-4'>
      {icons.map((icon) => (
        <Icon key={icon.id} icon={icon} />
      ))}
    </div>
  )
}

function Icon({ icon }: { icon: PublicIcon }) {
  const [isSelected, setIsSelected] = useState(false)
  const [lastTap, setLastTap] = useState(0)

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent double click from triggering single click
    if (e.detail === 1) {
      // Use setTimeout to avoid immediate trigger with double click
      setTimeout(() => {
        setIsSelected(true)
      }, 100)
    }
  }

  const handleDoubleClick = () => {
    console.log('Parallel route trigger')
  }

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
        setIsSelected(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleDoubleClick()
      }

      if (e.key === 'Escape') {
        setIsSelected(false)
      }

      if (e.key === 'Tab') {
        setIsSelected(false)
      }
    }

    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [icon.id])

  return (
    <button
      data-icon-id={icon.id}
      className={cn(
        'flex flex-col items-center justify-center size-36 p-2 gap-2 cursor-pointer mx-auto focus:outline-none group focus:text-white',
        isSelected && 'text-white'
      )}
      aria-label={icon.prompt}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
    >
      <div
        className={cn(
          'relative',
          'group-focus:after:content-[" "] group-focus:after:absolute group-focus:after:inset-0 group-focus:after:bg-blue-900/50 group-focus:after:size-[50px] group-focus:after:border-[1px] group-focus:after:border-dotted group-focus:after:border-foreground',
          isSelected &&
            'after:content-[" "] after:absolute after:inset-0 after:bg-blue-900/50 after:size-[50px] after:border-[1px] after:border-dotted after:border-foreground'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='select-none bg-white'
          src={icon.url}
          alt={icon.prompt}
          width={50}
          height={50}
        />
      </div>
      <p
        className={cn(
          'select-none text-sm w-fit max-w-full truncate text-center border-[1px] border-background',
          'group-focus:bg-blue-900/50 group-focus:border-dotted group-focus:border-foreground group-focus:text-white',
          isSelected &&
            'bg-blue-900/50 border-dotted border-foreground text-white'
        )}
      >
        {icon.prompt}
      </p>
    </button>
  )
}

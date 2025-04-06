'use client'

import { cn } from '@/app/utils/classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TabsProps {
  tabs: {
    href: string
    label: string
  }[]
  className?: string
}

export function Tabs({ tabs, className }: TabsProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'flex items-center justify-center w-full relative gap-1',
        // Highlight bar
        'after:absolute before:absolute',
        'after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-highlight after:z-20',
        // Background bar
        'before:bottom-[2.5px] before:left-0 before:right-0 before:h-[3px] before:bg-background before:z-10',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative group h-[42px] focus-within:outline-none',
              // Black right drop shadow
              'after:shadow-[2.5px_0_0_var(--foreground)] after:absolute after:top-3.5 after:right-0 after:h-[calc(100%-14px)] after:w-[2.5px]',
              'before:w-full before:-bottom-[6px] before:h-[6px] before:bg-background before:absolute before:z-40 before:left-0',
              isActive && 'after:z-30'
            )}
            prefetch
          >
            <div
              className={cn(
                'relative px-4 py-1.5 group-hover:translate-y-0.5 transition-transform transform-gpu group-focus-within:translate-y-0.5',
                'pixel-corners-top pixel-border-highlight bg-background',
                // Gray right shadow
                'after:w-1 after:h-[calc(100%+6px)] after:absolute after:-right-1 after:top-0 after:bg-light-shadow',
                isActive ? 'z-30' : 'z-0'
              )}
            >
              <p>{tab.label}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

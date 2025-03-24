'use client'

import { cn } from '@/app/utils/classnames'
import { signOut, useSession } from '@/lib/auth/client'
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
  const { data: session } = useSession()

  return (
    <div
      className={cn(
        'flex items-center justify-center w-screen relative gap-1',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-highlight z-20',
        'before:absolute before:bottom-[2.5px] before:left-0 before:right-0 before:h-[2.5px] before:bg-background before:z-10',
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
              'relative',
              // Black right drop shadow
              'after:shadow-[2.5px_0_0_rgba(0,0,0,0.2)] after:shadow-black/90 after:absolute after:top-3 after:right-0 after:h-[calc(100%-12px)] after:w-[2.5px] ',
              isActive && 'after:z-30'
            )}
          >
            <div
              className={cn(
                'relative px-4 py-1.5 hover:bg-hover',
                'pixel-corners-top pixel-border-highlight bg-background',
                // Gray right shadow
                'after:w-1 after:h-[calc(100%+2.5px)] after:absolute after:-right-1 after:top-0 after:bg-light-shadow',
                isActive ? 'z-20' : 'z-0'
              )}
            >
              <span>{tab.label}</span>
            </div>
          </Link>
        )
      })}
      {session && (
        <button
          onClick={() => {
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = '/'
                },
              },
            })
          }}
          className={cn(
            'relative',
            // Black right drop shadow
            'after:shadow-[2.5px_0_0_rgba(0,0,0,0.2)] after:shadow-black/90 after:absolute after:top-3 after:right-0 after:h-[calc(100%-12px)] after:w-[2.5px]'
          )}
        >
          <div
            className={cn(
              'relative px-4 py-1.5 hover:bg-hover',
              'pixel-corners-top pixel-border-highlight bg-background',
              // Gray right shadow
              'after:w-1 after:h-[calc(100%+2.5px)] after:absolute after:-right-1 after:top-0 after:bg-light-shadow'
            )}
          >
            <span>sign out</span>
          </div>
        </button>
      )}
    </div>
  )
}

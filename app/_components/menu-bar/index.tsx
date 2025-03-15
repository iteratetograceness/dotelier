'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuBarItem {
  label: string
  onClick?: () => void
  href?: string
}

interface MenuBarProps {
  config: MenuBarItem[]
}

export function MenuBar({ config }: MenuBarProps) {
  const pathname = usePathname()
  return (
    <div className='w-full flex items-center p-1 border-b-2 border-1.5 border-foreground bg-background gap-0.5'>
      {config.map((item) => {
        if (item.href) {
          return (
            <Link
              className={`hover:bg-medium px-2 ${
                item.href === pathname ? 'bg-medium' : ''
              }`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          )
        }

        return (
          <button
            className='hover:bg-medium px-2'
            key={item.label}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

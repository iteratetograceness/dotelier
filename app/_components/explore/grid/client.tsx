'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Icon, PublicIcon } from '../icon'
import { cn } from '@/app/utils/classnames'

export const PARENT_ID = 'icon-grid'

export function IconGridClient({
  icons,
}: {
  icons: Omit<PublicIcon, 'created_at' | 'category' | 'owner'>[]
}) {
  const prefersReducedMotion = useReducedMotion()
  const [active, setActive] = useState<string>()
  const containerRef = useRef<HTMLDivElement>(null)

  const container = {
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.01,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  }

  return (
    <div id={PARENT_ID} className='relative w-full flex-1'>
      <motion.div
        ref={containerRef}
        variants={container}
        initial='hidden'
        animate='show'
        className={cn(
          'w-[296px] md:w-[312px] min-h-[592px] h-[592px] md:h-[608px] p-2 md:p-4',
          'flex flex-col flex-wrap gap-0'
        )}
      >
        {icons.map((icon) => (
          <Icon
            key={icon.id}
            icon={icon}
            active={active === icon.id}
            setActive={setActive}
          />
        ))}
      </motion.div>
    </div>
  )
}

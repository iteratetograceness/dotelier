'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Icon, PublicIcon } from '../icon'

export const PARENT_ID = 'icon-grid'

export function IconGridClient({ icons }: { icons: PublicIcon[] }) {
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
    <motion.div
      id={PARENT_ID}
      ref={containerRef}
      variants={container}
      initial='hidden'
      animate='show'
      className='grid grid-flow-col auto-cols-[70px] grid-rows-[repeat(auto-fill,96px)] w-full h-[calc(100%-40px)] overflow-y-auto gap-2 p-4'
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
  )
}

'use client'

import { Cooper } from '@/app/icons/cooper'
import { Louie } from '@/app/icons/louie'
import { cn } from '@/app/utils/classnames'
import { motion } from 'motion/react'
import { useState } from 'react'

export function Pups() {
  const [topPup, setTopPup] = useState<'cooper' | 'louie'>('louie')

  return (
    <div className='absolute top-2 left-0 pointer-events-none'>
      <motion.div
        onClick={() => setTopPup('cooper')}
        className={cn(
          'absolute -top-[60px] left-0 cursor-pointer pointer-events-auto',
          topPup === 'cooper' ? 'z-[1]' : 'z-0'
        )}
        whileHover={{
          rotate: [0, -2, 2, -1, 1, 0],
          transition: { duration: 0.5, ease: 'easeInOut' },
        }}
        whileTap={{
          scale: 0.95,
          rotate: [0, -3, 3, 0],
          transition: { duration: 0.3 },
        }}
      >
        <Cooper width={100} height={100} />
      </motion.div>
      <motion.div
        onClick={() => setTopPup('louie')}
        className={cn(
          'absolute -top-[60px] left-[50px] cursor-pointer pointer-events-auto',
          topPup === 'louie' ? 'z-[1]' : 'z-0'
        )}
        whileHover={{
          rotate: [0, 2, -2, 1, -1, 0],
          transition: { duration: 0.5, ease: 'easeInOut', delay: 0.1 },
        }}
        whileTap={{
          scale: 0.95,
          rotate: [0, 3, -3, 0],
          transition: { duration: 0.3 },
        }}
      >
        <Louie width={100} height={100} />
      </motion.div>
    </div>
  )
}

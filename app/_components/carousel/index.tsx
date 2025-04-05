'use client'

import { cn } from '@/app/utils/classnames'
import { AnimatePresence, motion } from 'motion/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface CarouselProps {
  children: React.ReactNode
  className?: string
  enableVibration?: boolean
  vibrationDuration?: number
  onSlideChange?: (index: number) => void
}

export interface CarouselControl {
  next: () => void
  prev: () => void
  goToSlide: (index: number) => void
  currentIndex: number
  totalItems: number
}

/**
 * ADD CONTROLS FOR ACCESSIBILITY
 *
 * When making CSS changes here, make sure to update the skeleton.tsx file
 * to match the new styles.
 */

export function Carousel({
  children,
  className,
  enableVibration = true,
  vibrationDuration = 50,
  onSlideChange,
}: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const hasVibration =
    typeof navigator !== 'undefined' && 'vibrate' in navigator

  const scrollToIndex = useCallback(
    (index: number, immediate = false) => {
      if (!scrollContainerRef.current) return

      const targetIndex = Math.max(0, Math.min(index, totalItems - 1))

      const items = Array.from(scrollContainerRef.current.children).filter(
        (child) => child.classList.contains('carousel-item')
      )

      if (items[targetIndex]) {
        if (enableVibration && hasVibration && targetIndex !== currentIndex) {
          navigator.vibrate(vibrationDuration)
        }

        items[targetIndex].scrollIntoView({
          behavior: immediate ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'start',
        })

        setCurrentIndex(targetIndex)
        onSlideChange?.(targetIndex)
      }
    },
    [
      currentIndex,
      enableVibration,
      hasVibration,
      onSlideChange,
      totalItems,
      vibrationDuration,
    ]
  )

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTotalItems(
        Array.from(scrollContainerRef.current.children).filter((child) =>
          child.classList.contains('carousel-item')
        ).length
      )
    }
  }, [children])

  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrolling) return

    setIsScrolling(true)

    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const itemWidth = container.offsetWidth
    const newIndex = Math.round(scrollLeft / itemWidth)

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)

      if (enableVibration && hasVibration) {
        navigator.vibrate(vibrationDuration)
      }
    }

    setTimeout(() => setIsScrolling(false), 150)
  }

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        const newWidth = entry.contentRect.width
        const newHeight = entry.contentRect.height

        if (
          !scrollContainerRef.current?.dataset.prevWidth ||
          !scrollContainerRef.current?.dataset.prevHeight ||
          newWidth !==
            parseFloat(scrollContainerRef.current.dataset.prevWidth) ||
          newHeight !==
            parseFloat(scrollContainerRef.current.dataset.prevHeight)
        ) {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.dataset.prevWidth = newWidth.toString()
            scrollContainerRef.current.dataset.prevHeight = newHeight.toString()
            scrollToIndex(currentIndex)
          }
        }
      }
    })

    const container = scrollContainerRef.current
    if (container) {
      resizeObserver.observe(container)
    }

    return () => resizeObserver.disconnect()
  }, [currentIndex, scrollToIndex])

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 xs:gap-6 md:gap-10',
        className
      )}
      style={{
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
        WebkitOverflowScrolling: 'touch',
        paddingLeft: '50%',
        paddingRight: '50%',
        direction: 'rtl',
        scrollBehavior: 'smooth',
        scrollSnapStop: 'always',
      }}
      onScroll={handleScroll}
    >
      <AnimatePresence mode='popLayout'>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            id={`carousel-item-${index}`}
            className='flex-none snap-center snap-always overflow-hidden'
            style={{
              direction: 'ltr',
            }}
            initial={{ opacity: 0, filter: 'blur(2px)', x: -10 * index }}
            animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
            exit={{ opacity: 0, filter: 'blur(2px)', x: -10 * index }}
            transition={{ duration: 0.3, delay: 0.1 * index + 0.4 }}
            data-is-current={index === currentIndex}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('carousel-item size-full', className)}>{children}</div>
  )
}

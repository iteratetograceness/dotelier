'use client'

import { cn } from '@/app/utils/classnames'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

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

export const Carousel = forwardRef<CarouselControl, CarouselProps>(
  function Carousel(
    {
      children,
      className,
      enableVibration = true,
      vibrationDuration = 50,
      onSlideChange,
    },
    ref
  ) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)

    const hasVibration =
      typeof navigator !== 'undefined' && 'vibrate' in navigator

    useEffect(() => {
      if (scrollContainerRef.current) {
        setTotalItems(
          Array.from(scrollContainerRef.current.children).filter((child) =>
            child.classList.contains('carousel-item')
          ).length
        )
      }
    }, [children])

    const scrollToIndex = useCallback(
      (index: number) => {
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
            behavior: 'smooth',
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

    useImperativeHandle(
      ref,
      () => ({
        next: () => scrollToIndex(currentIndex + 1),
        prev: () => scrollToIndex(currentIndex - 1),
        goToSlide: scrollToIndex,
        currentIndex,
        totalItems,
      }),
      [currentIndex, scrollToIndex, totalItems]
    )

    return (
      <div className={cn('w-full', className)}>
        <div
          ref={scrollContainerRef}
          className='flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-8'
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            paddingLeft: '50%',
            paddingRight: '50%',
            direction: 'rtl',
          }}
          onScroll={handleScroll}
        >
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className='carousel-item snap-center'
              style={{
                direction: 'ltr',
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('carousel-item w-full h-full', className)}>
      {children}
    </div>
  )
}

'use client'

import { useSession } from '@/lib/auth/client'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { LazyMotion, Variants, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import { Children, useCallback, useEffect, useState } from 'react'
import { Button } from '../button'
import './index.css'
import { useCarousel } from './use-carousel'

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const slideVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
}

export function Carousel({ children }: { children: React.ReactNode }) {
  const { setCarousel } = useCarousel()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [slideCount, setSlideCount] = useState(0)
  const { data: session } = useSession()

  // Filter children to prevent empty slides when logged out
  // The Suspense wrapper around PixelGroup would create an empty slide if not filtered
  const childrenArray = Children.toArray(children).filter((child, index) => {
    if (index === 0) return true // Always keep first child (canvas)
    return Boolean(session?.user) // Only keep PixelGroup wrapper when logged in
  })

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      direction: 'rtl',
      containScroll: false,
      watchDrag: (_api, evt) => {
        if (evt.target && (evt.target as Element).nodeName === 'CANVAS') {
          return false
        }
        return true
      },
      skipSnaps: true,
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis: 'x',
      }),
    ]
  )

  // Helper to count non-empty slides
  const countNonEmptySlides = useCallback(() => {
    if (!emblaRef.current) return 0
    const slides = emblaRef.current.querySelectorAll('.embla__slide')
    return Array.from(slides).filter(slide => {
      const hasText = slide.textContent?.trim().length > 0
      const hasElements = slide.querySelector('canvas, img:not([alt=""]), button:not([disabled]), input')
      return hasText || hasElements
    }).length
  }, [emblaRef])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
    const count = countNonEmptySlides()
    setSlideCount(count)
    const next = emblaApi.canScrollNext()
    const prev = emblaApi.canScrollPrev()
    const isLoggedIn = Boolean(session?.user)
    setCanScrollLeft(next && isLoggedIn && count > 1)
    setCanScrollRight(prev && count > 1)
  }, [emblaApi, session, countNonEmptySlides])

  const scrollToRight = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollToLeft = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollToNewCanvas = useCallback(() => {
    if (emblaApi) emblaApi.scrollTo(0)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi) {
      setCarousel(emblaApi)
    }
  }, [emblaApi, setCarousel])

  // Fix positioning when there's only 1 slide
  useEffect(() => {
    if (!emblaApi) return

    const actualSlideCount = childrenArray.length

    if (actualSlideCount === 1) {
      // Reinitialize with LTR for single slide to center it properly
      emblaApi.reInit({
        direction: 'ltr', // Use LTR for single slide to center it
        containScroll: 'trimSnaps',
        watchDrag: (_api, evt) => {
          if (evt.target && (evt.target as Element).nodeName === 'CANVAS') {
            return false
          }
          // Allow drag for bouncy effect even with 1 slide
          return true
        },
        skipSnaps: true,
      })
    } else {
      // Multiple slides: use RTL
      emblaApi.reInit({
        direction: 'rtl',
        containScroll: false,
        watchDrag: (_api, evt) => {
          if (evt.target && (evt.target as Element).nodeName === 'CANVAS') {
            return false
          }
          return true
        },
        skipSnaps: true,
      })
    }
  }, [emblaApi, childrenArray.length])

  useEffect(() => {
    if (!emblaApi) return

    const onScroll = () => {
      const nonEmptyCount = countNonEmptySlides()

      // For single slide, let Embla handle centering naturally
      if (nonEmptyCount <= 1) {
        return
      }

      // Normal boundary checking for multiple slides
      const index = emblaApi.selectedScrollSnap()
      const totalSlides = emblaApi.scrollSnapList().length
      if (index < 0) {
        emblaApi.scrollTo(0, false)
      } else if (index >= totalSlides) {
        emblaApi.scrollTo(totalSlides - 1, false)
      }
    }

    const onSettle = () => {
      const nonEmptyCount = countNonEmptySlides()

      // For single slide, let Embla settle naturally to center
      if (nonEmptyCount <= 1) {
        return
      }

      // Normal boundary checking
      const index = emblaApi.selectedScrollSnap()
      const totalSlides = emblaApi.scrollSnapList().length
      if (index < 0 || index >= totalSlides) {
        emblaApi.scrollTo(Math.max(0, Math.min(index, totalSlides - 1)), false)
      }
    }

    emblaApi.on('scroll', onScroll)
    emblaApi.on('settle', onSettle)
    return () => {
      emblaApi.off('scroll', onScroll)
      emblaApi.off('settle', onSettle)
    }
  }, [emblaApi, slideCount, countNonEmptySlides])

  return (
    <section
      className='embla w-screen m-auto'
      dir={childrenArray.length === 1 ? 'ltr' : 'rtl'} // LTR centers single slide, RTL aligns multiple slides right
    >
      <div className='flex w-full items-center justify-center pb-4' dir='ltr'>
        <Button disabled={slideCount <= 1 || !canScrollLeft} onClick={scrollToLeft}>
          {'<'}
        </Button>
        <Button
          aria-label='Go to new canvas'
          onClick={scrollToNewCanvas}
          disabled={slideCount <= 1 || currentIndex === 0}
        >
          +
        </Button>
        <Button onClick={scrollToRight} disabled={slideCount <= 1 || !canScrollRight}>
          {'>'}
        </Button>
      </div>
      <div className='embla__viewport overflow-hidden' ref={emblaRef}>
        <LazyMotion features={domAnimation}>
          <m.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='embla__container flex max-w-full'
            style={childrenArray.length === 1 ? { justifyContent: 'center' } : {}} // Center single slide horizontally
          >
            {childrenArray.map((child, index) => (
              <m.div
                className='embla__slide'
                dir='ltr'
                key={index}
                variants={slideVariants}
              >
                {child}
              </m.div>
            ))}
          </m.div>
        </LazyMotion>
      </div>
    </section>
  )
}

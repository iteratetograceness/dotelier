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
  const { data: session } = useSession()

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

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
    const next = emblaApi.canScrollNext()
    const isLoggedIn = Boolean(session?.user)
    setCanScrollLeft(next && isLoggedIn)
  }, [emblaApi, session])

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
    if (emblaApi) setCarousel(emblaApi)
  }, [emblaApi, setCarousel])

  return (
    <section className='embla w-screen' dir='rtl'>
      <div className='flex w-full items-center justify-center pb-4' dir='ltr'>
        <Button
          aria-label='Go to previous canvas'
          disabled={!canScrollLeft}
          onClick={scrollToLeft}
        >
          {'<'}
        </Button>
        <Button
          aria-label='Go to new canvas'
          onClick={scrollToNewCanvas}
          disabled={currentIndex === 0}
        >
          +
        </Button>
        <Button
          aria-label='Go to next canvas'
          onClick={scrollToRight}
          disabled={currentIndex === 0}
        >
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
          >
            {Children.map(children, (child, index) => (
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

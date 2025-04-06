'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { AnimatePresence, motion } from 'motion/react'
import { Children, useCallback, useEffect, useState } from 'react'
import { Button } from '../button'
import './index.css'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const slideVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
}

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaReady, setEmblaReady] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setEmblaReady(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

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
    setCanScrollLeft(next)
  }, [emblaApi])

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

  return (
    <AnimatePresence>
      {emblaReady ? (
        <motion.section
          initial={{ opacity: 0, filter: 'blur(2px)', scale: 0.99 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(2px)', scale: 0.99 }}
          transition={{
            opacity: { duration: 0.4, ease: 'easeOut' },
            filter: { duration: 0.4, ease: 'easeOut' },
            scale: { type: 'spring', stiffness: 250, damping: 22 },
          }}
          className='embla w-screen m-auto'
          dir='rtl'
        >
          <div
            className='flex w-full items-center justify-center pb-4'
            dir='ltr'
          >
            <Button disabled={!canScrollLeft} onClick={scrollToLeft}>
              {'<'}
            </Button>
            <Button
              aria-label='Go to new canvas'
              onClick={scrollToNewCanvas}
              disabled={currentIndex === 0}
            >
              +
            </Button>
            <Button onClick={scrollToRight} disabled={currentIndex === 0}>
              {'>'}
            </Button>
          </div>
          <div className='embla__viewport overflow-hidden' ref={emblaRef}>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='embla__container flex max-w-full'
            >
              {Children.map(children, (child, index) => (
                <motion.div
                  className='embla__slide'
                  dir='ltr'
                  key={index}
                  variants={slideVariants}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}

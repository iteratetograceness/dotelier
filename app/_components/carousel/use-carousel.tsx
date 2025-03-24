import { useRef } from 'react'
import { CarouselControl } from '.'

export function useCarousel() {
  const ref = useRef<CarouselControl>(null)

  return {
    carouselRef: ref,
    next: () => ref.current?.next(),
    prev: () => ref.current?.prev(),
    goToSlide: (index: number) => ref.current?.goToSlide(index),
    get currentIndex() {
      return ref.current?.currentIndex ?? 0
    },
    get totalItems() {
      return ref.current?.totalItems ?? 0
    },
  }
}

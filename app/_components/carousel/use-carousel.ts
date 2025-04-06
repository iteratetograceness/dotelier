import { EmblaCarouselType } from 'embla-carousel'
import { create } from 'zustand'

type EmblaState = {
  carousel: EmblaCarouselType | null
  setCarousel: (api: EmblaCarouselType) => void
}

export const useCarousel = create<EmblaState>((set) => ({
  carousel: null,
  setCarousel: (carousel) => set({ carousel }),
}))

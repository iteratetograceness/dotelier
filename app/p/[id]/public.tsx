'use client'

import { usePixelVersion } from '@/app/swr/use-pixel-version'

export function PublicPixelView({
  pixel,
}: {
  pixel: {
    id: string
    createdAt: Date
    prompt: string
    showExplore: boolean
    updatedAt: Date | null
    userId: string
  }
}) {
  const { data } = usePixelVersion({ id: pixel.id })
  return <div>{pixel.prompt}</div>
}

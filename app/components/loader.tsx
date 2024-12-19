'use client'

import { useState, useEffect } from 'react'

interface RetroLoaderProps {
  totalSegments?: number
  segmentWidth?: number
  segmentGap?: number
  height?: number
}

export default function RetroLoader({
  totalSegments = 12,
  segmentWidth = 16,
  segmentGap = 3,
  height = 24,
}: RetroLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((prev) => {
        if (prev >= totalSegments) {
          return 0
        }
        return prev + 1
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [progress, totalSegments])

  return (
    <div className='p-8 text-foreground flex flex-col items-center justify-center gap-4'>
      <p className='text-center'>RUNNING DOTELIER.EXE...</p>

      <svg
        width={(segmentWidth + segmentGap) * totalSegments + 10}
        height={height + 12}
        className='[image-rendering:pixelated]'
      >
        {/* Border */}
        <rect
          x='0'
          y='0'
          width={(segmentWidth + segmentGap) * totalSegments + 10}
          height={height + 12}
          fill='none'
          stroke='currentColor'
          strokeWidth='6'
        />

        {/* Loading segments */}
        {Array.from({ length: totalSegments }).map((_, i) => (
          <rect
            key={i}
            x={i * (segmentWidth + segmentGap) + 6}
            y='6'
            width={segmentWidth}
            height={height}
            fill={i < progress ? 'currentColor' : 'none'}
            className='transition-[fill] duration-75'
          />
        ))}
      </svg>
    </div>
  )
}

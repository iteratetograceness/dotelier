'use client'

import { useEffect, useState } from 'react'

export function Time() {
  const userLocale = navigator.language
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let frameId: number

    function updateTime() {
      const now = new Date()
      setTime(now)

      const msUntilNextSecond = 1000 - now.getMilliseconds()

      timeoutId = setTimeout(() => {
        frameId = requestAnimationFrame(updateTime)
      }, msUntilNextSecond)
    }

    updateTime()

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const timeString = new Intl.DateTimeFormat(userLocale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(time)

  const [formattedTime, period] = timeString.split(/\s+/)

  return (
    <span className='flex items-center gap-1 text-sm'>
      <span>{formattedTime}</span>
      <span className='opacity-60 uppercase'>{period}</span>
    </span>
  )
}

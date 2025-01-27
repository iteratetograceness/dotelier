'use client'

import { useEffect, useState, useRef } from 'react'
import { WindowsProvider } from './context'
import { ResetWindowsButton, Windows } from './context'

const breakpoint = 1200

export function DraggableWindows() {
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  const timeout = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      setShow(window.innerWidth >= breakpoint)
    }

    handleResize()

    const debouncedResize = () => {
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedResize)
    return () => window.removeEventListener('resize', debouncedResize)
  }, [mounted])

  if (!mounted || !show) return null

  return (
    <WindowsProvider>
      <ResetWindowsButton className='absolute top-4 right-4' />
      <Windows />
    </WindowsProvider>
  )
}

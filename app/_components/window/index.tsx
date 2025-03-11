'use client'

import { useEffect, useRef, useState } from 'react'
import { Windows, WindowsProvider } from './context'

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
      <Windows />
    </WindowsProvider>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLogin } from './login'
import { redirect } from 'next/navigation'

export function AdminClient({ authorized = false }: { authorized?: boolean }) {
  const [showAdmin, setShowAdmin] = useState(false)

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'o'
      ) {
        e.preventDefault()
        if (authorized) redirect('/admin')
        setShowAdmin((prev) => !prev)
      }
    },
    [authorized]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAdmin) {
        setShowAdmin(false)
      }
    }

    if (showAdmin) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [showAdmin])

  return showAdmin ? <AdminLogin /> : null
}

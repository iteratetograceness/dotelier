'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { initialWindows, positionalData } from './control'
import { track } from '@vercel/analytics'
import { Button } from '../button'
import { Window } from './draggable-window'

export interface WindowMetadata {
  id: string
  initialPosition?: { x: number; y: number }
  zIndex: number
  isVisible: boolean
}

export type WindowMap = Record<string, WindowMetadata>

interface WindowsContextType {
  windows: WindowMap
  toggleWindow: (id: string) => void
  bringToFront: (id: string) => void
  resetWindows: () => void
  setInitialPositions: () => void
}

const WindowsContext = createContext<WindowsContextType>({
  windows: {},
  toggleWindow: () => {},
  bringToFront: () => {},
  resetWindows: () => {},
  setInitialPositions: () => {},
})

export function useWindows() {
  const context = useContext(WindowsContext)
  if (!context) {
    throw new Error('useWindows must be used within WindowsProvider')
  }
  return context
}

const TOP_Z_INDEX = 10

export function WindowsProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowMap>(initialWindows)
  const [topWindow, setTopWindow] = useState<string>('ratelimitinfo')

  const toggleWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVisible: !prev[id]?.isVisible,
      },
    }))
  }, [])

  // This may need refactor when we introduce more windows:
  const bringToFront = useCallback(
    (id: string) => {
      if (id === topWindow) return

      setWindows((prev) => {
        const updatedWindows = { ...prev }

        if (!topWindow) {
          updatedWindows[id] = {
            ...updatedWindows[id],
            zIndex: TOP_Z_INDEX,
          }
          return updatedWindows
        }

        const lastTopZIndex = updatedWindows[topWindow].zIndex
        const minusOne = Math.max(lastTopZIndex - 1, 2)

        updatedWindows[topWindow] = {
          ...updatedWindows[topWindow],
          zIndex: minusOne,
        }

        updatedWindows[id] = {
          ...updatedWindows[id],
          zIndex: lastTopZIndex,
        }

        return updatedWindows
      })

      setTopWindow(id)
    },
    [topWindow]
  )

  const setInitialPositions = useCallback(() => {
    setWindows((prevWindows) => {
      const updatedWindows: WindowMap = { ...prevWindows }

      positionalData.forEach((data) => {
        const anchorElement = document.getElementById(data.anchorElementId)

        if (!anchorElement) {
          return track('PortalPositionError', {
            windowId: data.windowId,
          })
        }

        const x = anchorElement.offsetLeft + data.deltaX
        const y = anchorElement.offsetTop + data.deltaY

        updatedWindows[data.windowId] = {
          ...updatedWindows[data.windowId],
          initialPosition: { x, y },
        }
      })

      return updatedWindows
    })
  }, [])

  const resetWindows = useCallback(() => {
    setWindows(initialWindows)
    setInitialPositions()
  }, [setInitialPositions])

  return (
    <WindowsContext.Provider
      value={{
        windows,
        toggleWindow,
        bringToFront,
        resetWindows,
        setInitialPositions,
      }}
    >
      {children}
    </WindowsContext.Provider>
  )
}

export function Windows() {
  const { windows, setInitialPositions } = useWindows()
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    setInitialPositions()
    setReady(true)
  }, [mounted, ready, setInitialPositions])

  if (!ready) return null

  return (
    <div className='fixed inset-0 pointer-events-none h-screen w-screen'>
      {Object.entries(windows).map(
        ([id, window]) =>
          Boolean(window.isVisible && window.initialPosition) && (
            <Window key={id} id={id} />
          )
      )}
    </div>
  )
}

export function ResetWindowsButton({ className }: { className?: string }) {
  const { resetWindows } = useWindows()

  return (
    <Button className={className} onClick={resetWindows}>
      Reset
    </Button>
  )
}

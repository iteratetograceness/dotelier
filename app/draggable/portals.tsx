'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { initialWindows, positionalData } from './control'
import { UniqueIdentifier } from '@dnd-kit/core'
import { InteractiveWindow } from '../components/window/interactive'
import { createPortal } from 'react-dom'
import { track } from '@vercel/analytics'
import { Button } from '../components/button'

export interface WindowData {
  id: UniqueIdentifier
  position?: { x: number; y: number }
  zIndex: number
  isVisible: boolean
}

type PortalContextType = {
  windows: Record<string, WindowData>
  toggleWindow: (id: UniqueIdentifier) => void
  updatePosition: (
    id: UniqueIdentifier,
    position: { x: number; y: number }
  ) => void
  bringToFront: (id: UniqueIdentifier) => void
  resetPortals: () => void
  setInitialPositions: () => void
}

const PortalContext = createContext<PortalContextType | null>(null)

export function usePortalManager() {
  const context = useContext(PortalContext)
  if (!context)
    throw new Error('usePortalManager must be used within PortalProvider')
  return context
}

const TOP_Z_INDEX = 10

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] =
    useState<Record<string, WindowData>>(initialWindows)
  const [topWindow, setTopWindow] = useState<UniqueIdentifier>()

  const toggleWindow = useCallback((id: UniqueIdentifier) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVisible: !prev[id]?.isVisible,
      },
    }))
  }, [])

  const updatePosition = useCallback(
    (id: UniqueIdentifier, position: { x: number; y: number }) => {
      console.log('updatePosition', id, position)
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          position,
        },
      }))
    },
    []
  )

  const bringToFront = useCallback(
    (id: UniqueIdentifier) => {
      if (id === topWindow) return // Already on top, no need to update

      setWindows((prev) => {
        const updatedWindows = { ...prev }

        if (topWindow) {
          const topZIndex = updatedWindows[topWindow].zIndex

          updatedWindows[topWindow] = {
            ...updatedWindows[topWindow],
            zIndex: Math.max(topZIndex - 1, 1),
          }

          updatedWindows[id] = {
            ...updatedWindows[id],
            zIndex: topZIndex,
          }
        } else {
          updatedWindows[id] = {
            ...updatedWindows[id],
            zIndex: TOP_Z_INDEX,
          }
        }

        return updatedWindows
      })
      setTopWindow(id)
    },
    [topWindow]
  )

  const setInitialPositions = useCallback(() => {
    positionalData.forEach((data) => {
      const anchorElement = document.getElementById(data.anchorElementId)

      if (!anchorElement) {
        track('PortalPositionError', {
          windowId: data.windowId,
        })
        return
      }

      updatePosition(data.windowId, {
        x: anchorElement.offsetLeft + data.deltaX,
        y: anchorElement.offsetTop + data.deltaY,
      })
    })
  }, [updatePosition])

  const resetPortals = useCallback(() => {
    setWindows(initialWindows)
    setInitialPositions()
  }, [setInitialPositions])

  return (
    <PortalContext.Provider
      value={{
        windows,
        toggleWindow,
        updatePosition,
        bringToFront,
        resetPortals,
        setInitialPositions,
      }}
    >
      {children}
    </PortalContext.Provider>
  )
}

export function Portals() {
  const { windows, setInitialPositions } = usePortalManager()

  // Render these portals AFTER mount so that we can dynamically set positions based on the viewport width
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setInitialPositions()
  }, [mounted, setInitialPositions])

  if (!mounted) return null

  return createPortal(
    <div className='fixed inset-0 pointer-events-none'>
      {Object.entries(windows).map(
        ([id, window]) =>
          window.isVisible && (
            <InteractiveWindow key={id} id={id} position={window.position} />
          )
      )}
    </div>,
    document.body
  )
}

export function ResetPortalButton({ className }: { className?: string }) {
  const { resetPortals } = usePortalManager()

  return (
    <Button className={className} onClick={resetPortals}>
      Reset
    </Button>
  )
}

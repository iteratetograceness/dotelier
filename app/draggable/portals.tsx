'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { initialWindows } from './control'
import { UniqueIdentifier } from '@dnd-kit/core'
import { InteractiveWindow } from '../components/window/interactive'
import { createPortal } from 'react-dom'

export interface WindowData {
  id: UniqueIdentifier
  position: { x: number; y: number }
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

  return (
    <PortalContext.Provider
      value={{
        windows,
        toggleWindow,
        updatePosition,
        bringToFront,
      }}
    >
      {children}
    </PortalContext.Provider>
  )
}

export function Portals() {
  const { windows } = usePortalManager()

  return createPortal(
    <div className='fixed inset-0 pointer-events-none'>
      <div className='pointer-events-auto'>
        {Object.entries(windows).map(
          ([id, window]) =>
            window.isVisible && (
              <InteractiveWindow key={id} id={id} position={window.position} />
            )
        )}
      </div>
    </div>,
    document.body
  )
}

'use client'

import { UniqueIdentifier, useDraggable } from '@dnd-kit/core'
import { CSSProperties } from 'react'
import { BaseWindow, BaseWindowProps } from './base'
import { usePortalManager } from '@/app/draggable/portals'
import { windowMetadata } from '@/app/draggable/control'
import { cn } from '@/app/utils/classnames'
import X from '@/app/icons/x'

export type InteractiveWindowProps = Omit<BaseWindowProps, 'children'> & {
  id: UniqueIdentifier
  position?: { x: number; y: number }
  closeable?: boolean
  disabled?: boolean
}

export function InteractiveWindow({
  id,
  closeable = true,
  disabled = false,
}: InteractiveWindowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } =
    useDraggable({
      id,
      disabled,
    })

  const { windows, toggleWindow } = usePortalManager()

  const window = windows[id]

  if (!window.isVisible) return null

  const transformStyle: CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {}

  const topLeftStyle: CSSProperties = disabled
    ? {}
    : {
        top: `${window.position?.y ?? 0}px`,
        left: `${window.position?.x ?? 0}px`,
      }


  if (!window.position) return null

  return (
    <BaseWindow
      variant={windowMetadata[id].variant}
      title={windowMetadata[id].title}
      className={cn(
        windowMetadata[id].className,
        'relative pointer-events-auto'
      )}
      headerProps={{
        ...listeners,
        ...attributes,
      }}
      headerChildren={
        closeable && (
          <button
            aria-label='Close window'
            onClick={() => toggleWindow(id)}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X />
          </button>
        )
      }
      style={{
        ...topLeftStyle,
        ...transformStyle,
        zIndex: window.zIndex,
      }}
      ref={setNodeRef}
      setActivatorNodeRef={setActivatorNodeRef}
    >
      {windowMetadata[id].children}
    </BaseWindow>
  )
}

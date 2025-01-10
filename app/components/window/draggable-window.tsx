import { useDraggable } from '@neodrag/react'
import { useMemo, useRef } from 'react'
import { BaseWindow, BaseWindowProps } from './base'
import { useWindows } from '@/app/components/window/context'
import { windowConfig } from '@/app/components/window/control'
import { cn } from '@/app/utils/classnames'

export type WindowProps = Omit<BaseWindowProps, 'children'> & {
  id: string
  closeable?: boolean
}

export function Window({ id }: WindowProps) {
  const { toggleWindow, windows, bringToFront } = useWindows()
  const window = useMemo(() => windows[id], [windows, id])
  const initialPosition = useMemo(
    () => window?.initialPosition,
    [window?.initialPosition]
  )
  const zIndex = useMemo(() => window?.zIndex, [window?.zIndex])

  const handleRef = useRef<HTMLDivElement>(null!)
  const draggableRef = useRef<HTMLDivElement>(null!)

  useDraggable(draggableRef, {
    defaultPosition: initialPosition || { x: 100, y: 100 },
    bounds: 'parent',
    handle: handleRef.current,
    cancel: 'button',
    gpuAcceleration: true,
    legacyTranslate: true,
    onDragStart: () => bringToFront(id),
  })

  const { variant, title, className, children, closeable } = windowConfig[id]

  return (
    <BaseWindow
      variant={variant}
      title={title}
      ref={draggableRef}
      handleRef={handleRef}
      className={cn(className, 'relative pointer-events-auto')}
      onClose={() => {
        if (closeable) toggleWindow(id)
      }}
      style={{ zIndex }}
    >
      {children}
    </BaseWindow>
  )
}

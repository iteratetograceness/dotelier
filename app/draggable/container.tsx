'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Portals, usePortalManager } from './portals'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { InteractiveWindow } from '../components/window/interactive'

export default function DDContainer() {
  const { updatePosition, windows } = usePortalManager()

  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const keyboardSensor = useSensor(KeyboardSensor)
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor)

  const [activeId, setActiveId] = useState<UniqueIdentifier>()

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function onDragEnd({ delta, active }: DragEndEvent) {
    setActiveId(undefined)
    updatePosition(active.id, {
      x: (windows[active.id]?.position?.x ?? 0) + delta.x,
      y: (windows[active.id]?.position?.y ?? 0) + delta.y,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <Portals />
      <DragOverlay
        dropAnimation={null}
        modifiers={[restrictToWindowEdges]}
        zIndex={1000}
      >
        {activeId ? <InteractiveWindow id={activeId} disabled /> : null}
      </DragOverlay>
    </DndContext>
  )
}

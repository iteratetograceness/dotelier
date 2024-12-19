'use client'

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'

interface DndWrapperProps {
  children: React.ReactNode
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

export function DndWrapper({
  children,
  onDragStart,
  onDragEnd,
}: DndWrapperProps) {
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      modifiers={[restrictToWindowEdges]}
      measuring={{ droppable: { strategy: MeasuringStrategy.BeforeDragging } }}
    >
      {children}
      <DragOverlay dropAnimation={null} modifiers={[restrictToWindowEdges]} />
    </DndContext>
  )
}

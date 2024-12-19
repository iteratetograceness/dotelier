'use client'

import { startTransition, useState } from 'react'
import { DragEndEvent, useDroppable } from '@dnd-kit/core'
import { WindowCard } from '../components/window'
import { PixelGenerator } from '../components/form'
import { DndWrapper } from './wrapper'
import { Button } from '../components/button'

export default function DDContainer() {
  const [dragActive, setDragActive] = useState(false)
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({})
  const { setNodeRef } = useDroppable({ id: 'droppable' })

  function handleDragStart() {
    if (dragActive) return

    const draggableElements = document.querySelectorAll('[id^="draggable-"]')

    draggableElements.forEach((element) => {
      const id = element.id.split('-')[1]
      const rect = element.getBoundingClientRect()
      startTransition(() => {
        setPositions((prev) => ({
          ...prev,
          [id]: { x: rect.left, y: rect.top },
        }))
      })
    })

    startTransition(() => {
      setDragActive(true)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const id = active.id as string
    setPositions((prev) => ({
      ...prev,
      [id]: {
        x: (prev[id]?.x ?? 0) + delta.x,
        y: (prev[id]?.y ?? 0) + delta.y,
      },
    }))
  }

  return (
    <DndWrapper onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={`size-screen pb-12 ${
          dragActive ? '' : 'flex flex-col items-center gap-8'
        }`}
        ref={setNodeRef}
      >
        <WindowCard
          className='w-[250px] sm:w-fit'
          variant='secondary'
          id='subtitle'
          position={positions.subtitle}
          draggable={dragActive}
        >
          <h2 className='font-normal text-lg sm:text-xl sm:px-12 text-center'>
            A PIXEL ICON GENERATOR
          </h2>
        </WindowCard>
        <PixelGenerator positions={positions} draggable={dragActive} />
      </div>
      <Button
        className='absolute bottom-4 right-4'
        onClick={() => {
          window.location.reload()
        }}
      >
        Reset Page
      </Button>
    </DndWrapper>
  )
}

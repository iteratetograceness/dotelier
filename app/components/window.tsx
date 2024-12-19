'use client'

import { useDraggable } from '@dnd-kit/core'
import { useState, useEffect } from 'react'

const VARIANTS = {
  default: {
    background: 'bg-background',
    border: 'border-background',
    accent: 'bg-foreground',
    accentText: 'text-background',
    text: 'text-foreground',
  },
  secondary: {
    background: 'bg-foreground',
    border: 'border-foreground',
    accent: 'bg-background',
    accentText: 'text-foreground',
    text: 'text-background',
  },
}

interface WindowProps {
  variant?: keyof typeof VARIANTS
  title?: string
  children: React.ReactNode
  className?: string
  id: string
  position: { x: number; y: number }
  draggable: boolean
  closeable?: boolean
}

export function WindowCard({
  variant = 'default',
  title,
  id,
  children,
  className,
  position,
  draggable,
  closeable = true,
}: WindowProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })
  const [isOpen, setIsOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { background, border, accent, accentText, text } = VARIANTS[variant]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isOpen) return null
  if (!isMounted) return null

  const style = {
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : {}),
    ...(draggable && position
      ? {
          position: 'absolute' as const,
          top: position.y,
          left: position.x,
        }
      : {}),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col border-[3px] p-1 pt-0 ${border} ${accent} ${accentText} ${className}`}
      id={`draggable-${id}`}
    >
      <div
        className='flex items-center justify-between w-full h-7 px-1 pt-1'
        {...listeners}
        {...attributes}
      >
        <span className='text-xl font-normal flex-1'>{title}</span>
        {closeable && (
          <button
            onClick={() => setIsOpen(false)}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X />
          </button>
        )}
      </div>
      <div className={`p-4 flex-1 ${text} ${background}`}>{children}</div>
    </div>
  )
}

function X() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect x='2' y='2' width='2' height='2' fill='currentColor' />
      <rect x='12' y='2' width='2' height='2' fill='currentColor' />
      <rect x='4' y='4' width='2' height='2' fill='currentColor' />
      <rect x='10' y='4' width='2' height='2' fill='currentColor' />
      <rect x='6' y='6' width='4' height='4' fill='currentColor' />
      <rect x='4' y='10' width='2' height='2' fill='currentColor' />
      <rect x='10' y='10' width='2' height='2' fill='currentColor' />
      <rect x='2' y='12' width='2' height='2' fill='currentColor' />
      <rect x='12' y='12' width='2' height='2' fill='currentColor' />
    </svg>
  )
}

'use client'

import { DEFAULT_GRID_SETTINGS, GridSettings } from '@/app/swr/use-pixel-version'
import { getPublicPixelAsset } from '@/lib/ut/client'
import {
  memo,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { DEFAULT_SIZE, GRID_ITEM_SIZE, PixelEditor } from './editor'

interface HtmlCanvasProps {
  id: string
  fileKey: string
  gridSize: number
  gridSettings?: GridSettings | null
  onHistoryChange: () => void
  onLoadingChange?: (isLoading: boolean) => void
}

export interface HtmlCanvasRef {
  getEditor: () => PixelEditor | null
  getCanvas: () => HTMLCanvasElement | null
}

export const HtmlCanvasWithRef = memo(function HtmlCanvasWithRef({
  id,
  ref,
  fileKey,
  gridSize,
  gridSettings,
  onHistoryChange,
  onLoadingChange,
}: HtmlCanvasProps & { ref: Ref<HtmlCanvasRef> }) {
  const url = getPublicPixelAsset(fileKey)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<PixelEditor | null>(null)
  const [error, setError] = useState<string>()

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editorRef.current,
      getCanvas: () => canvasRef.current,
    }),
    []
  )

  useEffect(() => {
    if (!canvasRef.current || !previewCanvasRef.current) return

    const canvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    // Use gridSize from DB, defaulting to DEFAULT_SIZE for backwards compatibility
    const effectiveGridSize = gridSize || DEFAULT_SIZE
    const size = effectiveGridSize * GRID_ITEM_SIZE
    canvas.width = size
    canvas.height = size
    previewCanvas.width = size
    previewCanvas.height = size

    const editor = new PixelEditor(
      canvas,
      previewCanvas,
      effectiveGridSize,
      onHistoryChange
    )

    editorRef.current = editor

    if (url) {
      const effectiveSettings = gridSettings ?? DEFAULT_GRID_SETTINGS
      onLoadingChange?.(true)
      editor
        .loadImageWithUnfake(url, effectiveSettings)
        .then(() => {
          // Trigger history change to refresh palette
          onHistoryChange()
        })
        .catch((error) => {
          setError(error.message)
        })
        .finally(() => {
          onLoadingChange?.(false)
        })
    }

    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [onHistoryChange, onLoadingChange, url, gridSize, gridSettings])

  return error ? (
    <div className='size-full flex items-center justify-center'>
      <p className='text-sm text-shadow'>{error}</p>
    </div>
  ) : (
    <div className='relative size-full'>
      <canvas
        id={`main-canvas-${id}`}
        ref={canvasRef}
        className='size-full cursor-crosshair'
        style={{
          touchAction: 'none',
        }}
        role='img'
        aria-label='Pixel art editor canvas. Use drawing tools to create pixel art.'
      />
      <canvas
        id={`preview-canvas-${id}`}
        ref={previewCanvasRef}
        className='size-full pointer-events-none absolute inset-0'
        style={{
          touchAction: 'none',
        }}
        aria-hidden='true'
      />
    </div>
  )
})

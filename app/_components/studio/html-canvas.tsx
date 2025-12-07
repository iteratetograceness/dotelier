'use client'

import { getPublicPixelAsset } from '@/lib/ut/client'
import { type UnfakeSettings } from '@/lib/unfake/types'
import {
  memo,
  Ref,
  useCallback,
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
  onHistoryChange: () => void
  unfakeSettings?: UnfakeSettings
}

export interface HtmlCanvasRef {
  getEditor: () => PixelEditor | null
  getCanvas: () => HTMLCanvasElement | null
  reprocessImage: (settings: UnfakeSettings) => Promise<void>
}

export const HtmlCanvasWithRef = memo(function HtmlCanvasWithRef({
  id,
  ref,
  fileKey,
  gridSize,
  onHistoryChange,
  unfakeSettings,
}: HtmlCanvasProps & { ref: Ref<HtmlCanvasRef> }) {
  const url = getPublicPixelAsset(fileKey)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<PixelEditor | null>(null)
  const urlRef = useRef<string | null>(null)
  const [error, setError] = useState<string>()

  // Store URL for reprocessing
  urlRef.current = url

  const reprocessImage = useCallback(
    async (settings: UnfakeSettings) => {
      const editor = editorRef.current
      const currentUrl = urlRef.current
      if (!editor || !currentUrl) return

      setError(undefined)
      try {
        await editor.loadImageWithUnfake(currentUrl, settings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reprocessing failed')
      }
    },
    []
  )

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editorRef.current,
      getCanvas: () => canvasRef.current,
      reprocessImage,
    }),
    [reprocessImage]
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
      editor.loadImageWithUnfake(url, unfakeSettings).catch((error) => {
        setError(error.message)
      })
    }

    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [onHistoryChange, url, gridSize, unfakeSettings])

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
      />
      <canvas
        id={`preview-canvas-${id}`}
        ref={previewCanvasRef}
        className='size-full pointer-events-none absolute inset-0'
        style={{
          touchAction: 'none',
        }}
      />
    </div>
  )
})

'use client'

import { getPublicPixelAsset } from '@/lib/ut/client'
import {
  memo,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { DEFAULT_SIZE, PixelEditor } from './editor'

const ZOOM_FACTOR = 10

interface HtmlCanvasProps {
  id: string
  fileKey: string
  onHistoryChange: () => void
}

export interface HtmlCanvasRef {
  getEditor: () => PixelEditor | null
  getCanvas: () => HTMLCanvasElement | null
}

export const HtmlCanvasWithRef = memo(function HtmlCanvasWithRef({
  id,
  ref,
  fileKey,
  onHistoryChange,
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
    canvas.width = DEFAULT_SIZE * ZOOM_FACTOR
    canvas.height = DEFAULT_SIZE * ZOOM_FACTOR
    previewCanvas.width = DEFAULT_SIZE * ZOOM_FACTOR
    previewCanvas.height = DEFAULT_SIZE * ZOOM_FACTOR

    const editor = new PixelEditor(
      canvas,
      previewCanvas,
      undefined,
      onHistoryChange
    )

    editorRef.current = editor

    if (url) {
      editor.loadSVG(url).catch((error) => {
        setError(error.message)
      })
    }

    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [url])

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

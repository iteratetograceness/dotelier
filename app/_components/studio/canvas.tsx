'use client'

import { cn } from '@/app/utils/classnames'
import { getPublicPixelAsset } from '@/lib/ut/client'
import { memo, use, useCallback, useEffect, useRef, useState } from 'react'
import { RgbaColor } from 'react-colorful'
import { StudioPixel } from '.'
import { Button } from '../button'
import { Pill } from '../pill'
import ColorPicker from './color-picker'
import { sharedClasses } from './constants'
import { DownloadButton } from './download-button'
import { Color } from './editor/renderer'
import { ToolName } from './editor/tool'
import { HtmlCanvasRef, HtmlCanvasWithRef } from './html-canvas'

function CanvasInner({
  pixel,
  versionPromise,
}: {
  pixel: StudioPixel
  versionPromise: Promise<
    | {
        id: string
        fileKey: string
      }
    | undefined
  >
}) {
  const pixelVersion = use(versionPromise)
  const editorRef = useRef<HtmlCanvasRef>(null)
  const [activeTool, setActiveTool] = useState<ToolName>('pen')

  const onColorChange = useCallback((color: RgbaColor) => {
    const colorArray = [color.r, color.g, color.b, color.a * 255] as Color
    editorRef.current?.getEditor()?.setColor(colorArray)
  }, [])

  useEffect(() => {
    const editor = editorRef.current?.getEditor()
    return () => editor?.destroy()
  }, [])

  return (
    <div id={`canvas-${pixel.id}`} className={cn(sharedClasses, 'h-fit')}>
      {/* Canvas */}
      <div
        className={cn(
          'flex items-center justify-center sm:max-w-[500px] sm:h-[500px]',
          'border-[2px] border-shadow border-r-background border-b-background',
          'w-full h-auto sm:h-full sm:w-auto aspect-square bg-white'
        )}
      >
        {pixelVersion ? (
          <HtmlCanvasWithRef
            id={pixel.id}
            fileKey={pixelVersion.fileKey}
            ref={editorRef}
          />
        ) : (
          <div className='text-center text-light-shadow text-sm w-full leading-4 flex flex-col items-center justify-center gap-1'>
            {/* Add icon */}
            <p>Failed to load pixel</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className='min-h-36 sm:min-h-auto min-w-auto sm:min-w-36 flex flex-col gap-3'>
        <div className='flex gap-1 text-xs'>
          <Pill className='flex-1 truncate whitespace-nowrap' variant='dark'>
            {pixel.prompt}
          </Pill>
          <Pill className='w-fit'>
            {pixel.updatedAt?.toLocaleDateString() ||
              pixel.createdAt.toLocaleDateString()}
          </Pill>
        </div>
        <div className='flex gap-1'>
          <Button
            aria-label='Toggle Grid'
            iconOnly
            onClick={() => {
              editorRef.current?.getEditor()?.toggleGrid()
            }}
          >
            <span>G</span>
          </Button>
        </div>

        {/* Color Picker */}
        <ColorPicker onChange={onColorChange} />

        {/* <HexColorInput /> */}
        <div className='flex flex-col w-full gap-0.5'>
          {/* TOOLS */}
          <div className='flex gap-0.5 h-10 sm:h-12 flex-wrap'>
            <Button
              aria-label='Pen Tool'
              iconOnly
              isPressed={activeTool === 'pen'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('pen')
                setActiveTool('pen')
              }}
            >
              <span>P</span>
            </Button>
            <Button
              aria-label='Eraser Tool'
              iconOnly
              isPressed={activeTool === 'eraser'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('eraser')
                setActiveTool('eraser')
              }}
            >
              <span>E</span>
            </Button>
            <Button
              aria-label='Fill Tool'
              iconOnly
              isPressed={activeTool === 'fill'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('fill')
                setActiveTool('fill')
              }}
            >
              <span>F</span>
            </Button>
            <Button
              aria-label='Line Tool'
              iconOnly
              isPressed={activeTool === 'line'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('line')
                setActiveTool('line')
              }}
            >
              <span>L</span>
            </Button>
          </div>

          {/* UNDO/REDO/CLEAR/RESET */}
          <div className='flex gap-0.5 h-10 sm:h-12'>
            <Button
              aria-label='Undo'
              iconOnly
              onClick={() => {
                editorRef.current?.getEditor()?.undo()
              }}
            >
              <span>U</span>
            </Button>
            <Button
              aria-label='Redo'
              iconOnly
              onClick={() => {
                editorRef.current?.getEditor()?.redo()
              }}
            >
              <span>R</span>
            </Button>
            <Button
              aria-label='Clear'
              onClick={() => {
                editorRef.current?.getEditor()?.clear()
              }}
            >
              <span>Clear</span>
            </Button>
            <Button
              aria-label='Reset'
              onClick={() => {
                if (pixelVersion) {
                  editorRef.current
                    ?.getEditor()
                    ?.loadSVG(getPublicPixelAsset(pixelVersion.fileKey))
                }
              }}
            >
              <span>Reset</span>
            </Button>
          </div>
          {/* DOWNLOAD/SAVE */}
          <div className='flex gap-0.5 h-10 sm:h-12'>
            <DownloadButton />
            <Button
              aria-label='Save'
              iconOnly
              onClick={() => {
                // Save to database
              }}
            >
              <span>S</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Canvas = memo(CanvasInner)

'use client'

import { cn } from '@/app/utils/classnames'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Compact from '@uiw/react-color-compact'
import { memo, startTransition, use, useRef, useState } from 'react'
import { StudioPixel } from '.'
import { Button } from '../button'
import { Pill } from '../pill'
import { sharedClasses } from './constants'
import { DownloadButton } from './download-button'
import { PixelEditorTool } from './editor'
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
  const [activeTool, setActiveTool] = useState<PixelEditorTool>(
    PixelEditorTool.Pen
  )
  const [currentHsvaColor, setCurrentHsvaColor] = useState({
    h: 0,
    s: 0,
    v: 0,
    a: 1,
  })

  return (
    <div
      id={`canvas-${pixel.id}`}
      className={cn(
        sharedClasses,
        'h-fit'
        // 'h-[calc(100%-144px)] sm:h-[450px]',
      )}
    >
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
        {/* Color Picker */}
        <Compact
          color={currentHsvaColor}
          onChange={(color) => {
            setCurrentHsvaColor(color.hsva)
            editorRef.current
              ?.getEditor()
              ?.setColor([
                color.rgba.r,
                color.rgba.g,
                color.rgba.b,
                Math.round(color.rgba.a * 255),
              ])
          }}
        />
        <div className='flex flex-col w-full gap-0.5'>
          {/* TOOLS */}
          <div className='flex gap-0.5 h-10 sm:h-12 flex-wrap'>
            {/* Pen */}
            <Button
              aria-label='Pen Tool'
              iconOnly
              isPressed={activeTool === PixelEditorTool.Pen}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool(PixelEditorTool.Pen)
                startTransition(() => {
                  setActiveTool(PixelEditorTool.Pen)
                })
              }}
            >
              <span>P</span>
            </Button>
            {/* Eraser */}
            <Button
              aria-label='Eraser Tool'
              iconOnly
              isPressed={activeTool === PixelEditorTool.Eraser}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool(PixelEditorTool.Eraser)
                startTransition(() => {
                  setActiveTool(PixelEditorTool.Eraser)
                })
              }}
            >
              <span>E</span>
            </Button>
            {/* Fill */}
            <Button
              aria-label='Fill Tool'
              iconOnly
              isPressed={activeTool === PixelEditorTool.Fill}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool(PixelEditorTool.Fill)
                startTransition(() => {
                  setActiveTool(PixelEditorTool.Fill)
                })
              }}
            >
              <span>F</span>
            </Button>
            {/* Circle */}
            <Button
              aria-label='Circle Tool'
              iconOnly
              isPressed={activeTool === PixelEditorTool.Circle}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool(PixelEditorTool.Circle)
                startTransition(() => {
                  setActiveTool(PixelEditorTool.Circle)
                })
              }}
            >
              <span>C</span>
            </Button>
            {/* Line */}
            <Button
              aria-label='Line Tool'
              iconOnly
              isPressed={activeTool === PixelEditorTool.Line}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool(PixelEditorTool.Line)
                startTransition(() => {
                  setActiveTool(PixelEditorTool.Line)
                })
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

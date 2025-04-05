'use client'

import { cn } from '@/app/utils/classnames'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
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
          'flex items-center justify-center',
          'border-[2px] border-shadow border-r-background border-b-background',
          'aspect-square bg-white',
          'w-full h-auto md:h-full md:w-auto '
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
      <div className='min-h-36 md:min-h-auto min-w-auto md:min-w-36 flex flex-col gap-3'>
        <div className='flex gap-1 text-xs'>
          <Pill className='flex-1 truncate whitespace-nowrap' variant='dark'>
            {pixel.prompt}
          </Pill>
          <Pill className='w-fit'>
            {pixel.updatedAt?.toLocaleDateString() ||
              pixel.createdAt.toLocaleDateString()}
          </Pill>
        </div>

        <div className='flex flex-col w-full p-2 border border-white border-r-shadow border-b-shadow h-fit'>
          <div className='flex flex-wrap md:max-w-[333px]'>
            <ColorPicker onChange={onColorChange} />
            <Button
              aria-label='Pen Tool'
              className='!h-10'
              iconOnly
              isPressed={activeTool === 'pen'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('pen')
                setActiveTool('pen')
              }}
            >
              <Image
                src='/editor/pen.png'
                alt='Pen Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button
              aria-label='Fill Tool'
              iconOnly
              className='!h-10'
              isPressed={activeTool === 'fill'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('fill')
                setActiveTool('fill')
              }}
            >
              <Image
                src='/editor/fill.png'
                alt='Fill Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button
              aria-label='Eraser Tool'
              iconOnly
              className='!h-10'
              isPressed={activeTool === 'eraser'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('eraser')
                setActiveTool('eraser')
              }}
            >
              <Image
                src='/editor/eraser.png'
                alt='Eraser Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button
              aria-label='Line Tool'
              iconOnly
              className='!h-10'
              isPressed={activeTool === 'line'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('line')
                setActiveTool('line')
              }}
            >
              <Image
                src='/editor/line.png'
                alt='Line Tool'
                width={25}
                height={25}
              />
            </Button>
            <Button
              aria-label='Toggle Grid'
              className='!h-10'
              iconOnly
              onClick={() => {
                editorRef.current?.getEditor()?.toggleGrid()
              }}
            >
              <Image src='/editor/grid.png' alt='Grid' width={25} height={25} />
            </Button>
            <Button
              aria-label='Undo'
              iconOnly
              className='!h-10'
              onClick={() => {
                editorRef.current?.getEditor()?.undo()
              }}
            >
              <Image
                src='/editor/arrow-left.png'
                alt='Undo'
                width={25}
                height={25}
              />
            </Button>
            <Button
              aria-label='Redo'
              iconOnly
              className='!h-10'
              onClick={() => {
                editorRef.current?.getEditor()?.redo()
              }}
            >
              <Image
                src='/editor/arrow-right.png'
                alt='Redo'
                width={25}
                height={25}
              />
            </Button>
            <Button
              iconOnly
              className='!h-10'
              aria-label='Clear'
              onClick={() => {
                editorRef.current?.getEditor()?.clear()
              }}
            >
              <Image
                src='/editor/trash.png'
                alt='Clear'
                width={25}
                height={25}
              />
            </Button>
            <DownloadButton iconOnly className='!h-10' />
            <Button
              aria-label='Save'
              iconOnly
              className='!h-10'
              onClick={() => {
                // Save to database
              }}
            >
              <Image src='/editor/save.png' alt='Save' width={25} height={25} />
            </Button>
            <Button
              aria-label='Reset'
              className='w-20 !px-1 !h-10'
              onClick={() => {
                if (pixelVersion) {
                  editorRef.current
                    ?.getEditor()
                    ?.loadSVG(getPublicPixelAsset(pixelVersion.fileKey))
                }
              }}
            >
              <span>reload</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Canvas = memo(CanvasInner)

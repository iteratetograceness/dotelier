'use client'

import {
  LatestPixelVersion,
  usePixelVersion,
} from '@/app/swr/use-pixel-version'
import { cn } from '@/app/utils/classnames'
import { Pixel } from '@/lib/db/types'
import { getPublicPixelAsset } from '@/lib/ut/client'
import Image from 'next/image'
import {
  memo,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { RgbaColor } from 'react-colorful'
import { toast } from 'sonner'
import { Button } from '../../button'
import { Pill } from '../../pill'
import ColorPicker from '../color-picker'
import { sharedClasses } from '../constants'
import { DownloadButton } from '../download-button'
import { Color } from '../editor/renderer'
import { ToolName } from '../editor/tool'
import { HtmlCanvasRef, HtmlCanvasWithRef } from '../html-canvas'
import { savePixel } from './save'

function CanvasInner({
  pixel,
  versionPromise,
}: {
  pixel: Pick<Pixel, 'id' | 'prompt' | 'createdAt' | 'updatedAt'>
  versionPromise: Promise<LatestPixelVersion | undefined>
}) {
  const initialData = use(versionPromise)
  const { data: pixelVersion } = usePixelVersion({
    id: pixel.id,
    initialData,
  })
  const editorRef = useRef<HtmlCanvasRef>(null)
  const [activeTool, setActiveTool] = useState<ToolName>('pen')
  const [isSaving, startTransition] = useTransition()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const onColorChange = useCallback((color: RgbaColor) => {
    const colorArray = [color.r, color.g, color.b, color.a * 255] as Color
    editorRef.current?.getEditor()?.setColor(colorArray)
  }, [])

  useEffect(() => {
    const editor = editorRef.current?.getEditor()
    return () => editor?.destroy()
  }, [])

  const disableActions = useMemo(
    () => isSaving || !pixelVersion,
    [isSaving, pixelVersion]
  )

  const onHistoryChange = useCallback(() => {
    const hasChanges = editorRef.current?.getEditor()?.hasUnsavedChanges()
    setHasUnsavedChanges(hasChanges || false)
  }, [])

  if (pixel.id && initialData?.fileKey) {
    console.log(initialData?.fileKey, getPublicPixelAsset(initialData.fileKey))
  }

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
        {pixelVersion?.fileKey ? (
          <HtmlCanvasWithRef
            id={pixel.id}
            fileKey={pixelVersion.fileKey}
            ref={editorRef}
            onHistoryChange={onHistoryChange}
          />
        ) : (
          <div className='text-center text-light-shadow text-sm w-full leading-4 flex flex-col items-center justify-center gap-1'>
            {/* WIP */}
            <p>Prepping your icon </p>
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
            <ColorPicker onChange={onColorChange} disabled={disableActions} />
            <Button
              aria-label='Pen Tool'
              className='!h-10'
              iconOnly
              isPressed={activeTool === 'pen'}
              onClick={() => {
                editorRef.current?.getEditor()?.setTool('pen')
                setActiveTool('pen')
              }}
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
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
              disabled={disableActions}
            >
              <Image
                src='/editor/trash.png'
                alt='Clear'
                width={25}
                height={25}
              />
            </Button>
            <DownloadButton
              iconOnly
              className='!h-10'
              onDownload={(as) => {
                editorRef.current?.getEditor()?.download({
                  fileName: pixel.prompt,
                  as,
                })
              }}
              disabled={disableActions}
            />
            <Button
              aria-label='Save'
              iconOnly
              className='!h-10'
              onClick={() => {
                startTransition(async () => {
                  if (!pixelVersion) return

                  const svgContent = editorRef.current
                    ?.getEditor()
                    ?.convertToSvg()

                  if (!svgContent) {
                    toast.error('Failed to save. Try again.')
                    return
                  }

                  await savePixel({
                    id: pixel.id,
                    version: pixelVersion?.version,
                    oldFileKey: pixelVersion?.fileKey,
                    svgContent,
                  })

                  editorRef.current?.getEditor()?.resetHistory()

                  toast.success('Saved!')
                })
              }}
              disabled={disableActions}
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
              disabled={!pixelVersion}
            >
              <span>reload</span>
            </Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <p className='bg-background pixel-corners text-center text-xs py-0.5'>
            You have unsaved changes
          </p>
        )}
      </div>
    </div>
  )
}

export const Canvas = memo(CanvasInner)

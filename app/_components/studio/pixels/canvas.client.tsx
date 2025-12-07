'use client'

import {
  LatestPixelVersion,
  usePixelVersion,
} from '@/app/swr/use-pixel-version'
import { cn } from '@/app/utils/classnames'
import { Pixel } from '@/lib/db/types'
import {
  DEFAULT_UNFAKE_SETTINGS,
  type UnfakeSettings,
} from '@/lib/unfake/types'
import { track } from '@vercel/analytics/react'
import Image from 'next/image'
import { Tooltip } from 'radix-ui'
import {
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
import { openEyeDropper } from '../../eye-dropper'
import { Pill } from '../../pill'
import ColorPicker, { hexToRgba } from '../color-picker'
import { sharedClasses } from '../constants'
import { GrooveDivider } from '../divider'
import { DownloadButton } from '../download-button'
import { Color } from '../editor/renderer'
import { ToolName } from '../editor/tool'
import { HtmlCanvasRef, HtmlCanvasWithRef } from '../html-canvas'
import { PenSize } from '../pen-size'
import { UnfakeSettingsPanel } from '../unfake-settings'
import { savePixel } from './save'

export function Canvas({
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
  const [isProcessing, startProcessing] = useTransition()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [rgbaColor, setRgbaColor] = useState<RgbaColor>({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  })
  const [isEyeDropperActive, startEyeDropper] = useTransition()
  const [unfakeSettings, setUnfakeSettings] = useState<UnfakeSettings>(
    DEFAULT_UNFAKE_SETTINGS
  )

  const onColorChange = useCallback((color: RgbaColor) => {
    const colorArray = [color.r, color.g, color.b, color.a * 255] as Color
    setRgbaColor(color)
    editorRef.current?.getEditor()?.setColor(colorArray)
  }, [])

  const onEyeDropperClick = useCallback(() => {
    startEyeDropper(async () => {
      const canvas = editorRef.current?.getCanvas()
      if (!canvas) {
        toast.error("We're having some trouble with the eyedropper tool!")
        return
      }

      try {
        const result = await openEyeDropper(canvas)
        const hex = result?.sRGBHex
        if (!hex) throw new Error('No HEX returned')
        const rgba = hexToRgba(hex)
        onColorChange(rgba)
      } catch (error) {
        toast.error("We're having some trouble with the eyedropper tool!")
        track('eye-dropper-error', {
          error: JSON.stringify(error),
        })
      }
    })
  }, [onColorChange])

  useEffect(() => {
    const editor = editorRef.current?.getEditor()
    return () => editor?.destroy()
  }, [])

  const disableActions = useMemo(
    () => isSaving || !pixelVersion || isEyeDropperActive || isProcessing,
    [isSaving, pixelVersion, isEyeDropperActive, isProcessing]
  )

  const onHistoryChange = useCallback(() => {
    const hasChanges = editorRef.current?.getEditor()?.hasUnsavedChanges()
    setHasUnsavedChanges(hasChanges || false)
  }, [])

  const onReprocess = useCallback(() => {
    startProcessing(async () => {
      try {
        await editorRef.current?.reprocessImage(unfakeSettings)
        toast.success('Image reprocessed!')
      } catch (error) {
        toast.error('Failed to reprocess image')
        track('reprocess-error', {
          error: JSON.stringify(error),
        })
      }
    })
  }, [unfakeSettings])

  return (
    <div id={`canvas-${pixel.id}`} className={cn(sharedClasses, 'h-fit')}>
      {/* Canvas */}
      <div
        className={cn(
          'flex items-center justify-center',
          'border-3 border-shadow border-r-background border-b-background',
          'aspect-square bg-white',
          'w-full h-auto md:h-full md:w-auto '
        )}
      >
        {pixelVersion?.fileKey ? (
          <HtmlCanvasWithRef
            id={pixel.id}
            fileKey={pixelVersion.fileKey}
            gridSize={pixelVersion.gridSize}
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
      <div className='min-h-36 md:min-h-auto min-w-auto md:min-w-36 flex flex-col gap-3 select-none'>
        <div className='flex gap-1 text-xs'>
          <Pill className='flex-1 truncate whitespace-nowrap' variant='dark'>
            {pixel.prompt}
          </Pill>
          <Pill className='w-fit'>
            {pixel.updatedAt?.toLocaleDateString() ||
              pixel.createdAt.toLocaleDateString()}
          </Pill>
        </div>

        <div className='flex flex-col w-full p-2 border-3 border-white border-r-shadow border-b-shadow h-fit gap-2'>
          <Tooltip.Provider>
            <div className='flex flex-wrap w-fit'>
              <ColorPicker
                setRgbaColor={onColorChange}
                rgbaColor={rgbaColor}
                disabled={disableActions}
              />
              <TooltipWrapper content='Tool Size'>
                <PenSize
                  className='size-11! flex items-center justify-center'
                  onChange={(size: number) =>
                    editorRef.current?.getEditor()?.setToolSize(size)
                  }
                />
              </TooltipWrapper>
              <TooltipWrapper content='Pen'>
                <Button
                  aria-label='Pen Tool'
                  className='size-11!'
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
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Fill'>
                <Button
                  aria-label='Fill Tool'
                  iconOnly
                  className='size-11!'
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
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Eraser'>
                <Button
                  aria-label='Eraser Tool'
                  iconOnly
                  className='size-11!'
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
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Line'>
                <Button
                  aria-label='Line Tool'
                  iconOnly
                  className='size-11!'
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
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Eyedropper'>
                <Button
                  aria-label='Eyedropper Tool'
                  iconOnly
                  className='size-11!'
                  onClick={onEyeDropperClick}
                  disabled={disableActions}
                >
                  <Image
                    src='/editor/eye-dropper.png'
                    alt='Eye Dropper Tool'
                    width={25}
                    height={25}
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Grid'>
                <Button
                  aria-label='Toggle Grid'
                  className='size-11!'
                  iconOnly
                  onClick={() => {
                    editorRef.current?.getEditor()?.toggleGrid()
                  }}
                  disabled={disableActions}
                >
                  <Image
                    src='/editor/grid.png'
                    alt='Grid'
                    width={25}
                    height={25}
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
            </div>
            <GrooveDivider className='w-full' />
            <div className='flex flex-wrap'>
              <TooltipWrapper content='Undo'>
                <Button
                  aria-label='Undo'
                  iconOnly
                  className='size-11!'
                  onClick={() => {
                    editorRef.current?.getEditor()?.undo()
                  }}
                  disabled={
                    disableActions || !editorRef.current?.getEditor()?.canUndo()
                  }
                >
                  <Image
                    src='/editor/arrow-left.png'
                    alt='Undo'
                    width={25}
                    height={25}
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Redo'>
                <Button
                  aria-label='Redo'
                  iconOnly
                  className='size-11!'
                  onClick={() => {
                    editorRef.current?.getEditor()?.redo()
                  }}
                  disabled={
                    disableActions || !editorRef.current?.getEditor()?.canRedo()
                  }
                >
                  <Image
                    src='/editor/arrow-right.png'
                    alt='Redo'
                    width={25}
                    height={25}
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Clear'>
                <Button
                  iconOnly
                  className='size-11!'
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
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
              <TooltipWrapper content='Download'>
                <DownloadButton
                  iconOnly
                  className='size-11!'
                  onDownload={(as) => {
                    editorRef.current?.getEditor()?.download({
                      fileName: pixel.prompt,
                      as,
                    })
                  }}
                  disabled={disableActions}
                />
              </TooltipWrapper>
              <TooltipWrapper content='Save'>
                <Button
                  aria-label='Save'
                  iconOnly
                  className='size-11!'
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

                      const gridSize =
                        editorRef.current?.getEditor()?.getGridSize() ?? 32

                      await savePixel({
                        id: pixel.id,
                        version: pixelVersion?.version,
                        oldFileKey: pixelVersion?.fileKey,
                        svgContent,
                        gridSize,
                      })

                      editorRef.current?.getEditor()?.resetHistory()

                      toast.success('Saved!')
                    })
                  }}
                  disabled={disableActions}
                >
                  <Image
                    src='/editor/save.png'
                    alt='Save'
                    width={25}
                    height={25}
                    className={cn(disableActions && 'opacity-50')}
                  />
                </Button>
              </TooltipWrapper>
            </div>
          </Tooltip.Provider>
        </div>

        <UnfakeSettingsPanel
          settings={unfakeSettings}
          onChange={setUnfakeSettings}
          onReprocess={onReprocess}
          disabled={disableActions}
          isProcessing={isProcessing}
        />

        {hasUnsavedChanges && (
          <p className='bg-background pixel-corners text-center text-xs py-0.5'>
            You have unsaved changes
          </p>
        )}
      </div>
    </div>
  )
}

export function TooltipWrapper({
  children,
  content,
}: {
  children: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={500}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className='bg-dark-hover text-highlight px-2'
            sideOffset={0}
            side='bottom'
          >
            {content}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

'use client'

import {
  DEFAULT_GRID_SETTINGS,
  GridSettings,
  LatestPixelVersion,
  usePixelVersion,
} from '@/app/swr/use-pixel-version'
import { ExpandIcon } from '@/app/icons/expand'
import { cn } from '@/app/utils/classnames'
import { Pixel } from '@/lib/db/types'
import { track } from '@vercel/analytics/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
import { Button, ButtonLink } from '../../button'
import { openEyeDropper } from '../../eye-dropper'
import { Pill } from '../../pill'
import ColorPicker, { hexToRgba } from '../color-picker'
import { sharedClasses } from '../constants'
import { GrooveDivider } from '../divider'
import { DownloadButton } from '../download-button'
import { Color } from '../editor/renderer'
import { ToolName } from '../editor/tool'
import { GridSettingsPanel } from '../grid-settings'
import { HtmlCanvasRef, HtmlCanvasWithRef } from '../html-canvas'
import { Palette } from '../palette'
import { PenSize } from '../pen-size'
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [rgbaColor, setRgbaColor] = useState<RgbaColor>({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  })
  const [isEyeDropperActive, setIsEyeDropperActive] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [gridSettings, setGridSettings] = useState<GridSettings>(
    pixelVersion?.gridSettings ?? DEFAULT_GRID_SETTINGS
  )
  const [currentGridSize, setCurrentGridSize] = useState(
    pixelVersion?.gridSize ?? 32
  )
  const [palette, setPalette] = useState<Array<[number, number, number, number]>>([])
  const pathname = usePathname()
  const isOnPixelPage = pathname === `/p/${pixel.id}`

  // Sync grid settings when pixel version changes
  useEffect(() => {
    if (pixelVersion?.gridSettings) {
      setGridSettings(pixelVersion.gridSettings)
    }
    if (pixelVersion?.gridSize) {
      setCurrentGridSize(pixelVersion.gridSize)
    }
  }, [pixelVersion?.gridSettings, pixelVersion?.gridSize])

  const onColorChange = useCallback((color: RgbaColor) => {
    const colorArray = [color.r, color.g, color.b, color.a * 255] as Color
    setRgbaColor(color)
    editorRef.current?.getEditor()?.setColor(colorArray)
  }, [])

  const onEyeDropperClick = useCallback(async () => {
    const canvas = editorRef.current?.getCanvas()
    if (!canvas) {
      toast.error("We're having some trouble with the eyedropper tool!")
      return
    }

    setIsEyeDropperActive(true)
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
    } finally {
      setIsEyeDropperActive(false)
    }
  }, [onColorChange])

  useEffect(() => {
    const editor = editorRef.current?.getEditor()
    return () => editor?.destroy()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const isMod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      // Tool shortcuts (no modifier)
      if (!isMod) {
        switch (key) {
          case 'p':
            e.preventDefault()
            editorRef.current?.getEditor()?.setTool('pen')
            setActiveTool('pen')
            break
          case 'b':
            e.preventDefault()
            editorRef.current?.getEditor()?.setTool('fill')
            setActiveTool('fill')
            break
          case 'e':
            e.preventDefault()
            editorRef.current?.getEditor()?.setTool('eraser')
            setActiveTool('eraser')
            break
          case 'l':
            e.preventDefault()
            editorRef.current?.getEditor()?.setTool('line')
            setActiveTool('line')
            break
          case 'g':
            e.preventDefault()
            editorRef.current?.getEditor()?.toggleGrid()
            break
          case 'i':
            e.preventDefault()
            onEyeDropperClick()
            break
        }
      }

      // Undo/Redo (with modifier)
      if (isMod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          editorRef.current?.getEditor()?.redo()
        } else {
          editorRef.current?.getEditor()?.undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEyeDropperClick])

  const disableActions = useMemo(
    () => isSaving || !pixelVersion || isEyeDropperActive,
    [isSaving, pixelVersion, isEyeDropperActive]
  )

  const refreshPalette = useCallback(() => {
    const colors = editorRef.current?.getEditor()?.getPalette()
    if (colors) {
      setPalette(colors as Array<[number, number, number, number]>)
    }
  }, [])

  const onHistoryChange = useCallback(() => {
    const hasChanges = editorRef.current?.getEditor()?.hasUnsavedChanges()
    setHasUnsavedChanges(hasChanges || false)
    // Update palette when canvas changes
    refreshPalette()
  }, [refreshPalette])

  const onInitialLoadingChange = useCallback((isLoading: boolean) => {
    setIsInitialLoading(isLoading)
  }, [])

  const onGridSettingsChange = useCallback(
    async (newSettings: GridSettings) => {
      setGridSettings(newSettings)
      setIsReprocessing(true)
      try {
        await editorRef.current?.getEditor()?.reloadWithSettings(newSettings)
        setHasUnsavedChanges(true)
        refreshPalette()
      } catch (error) {
        console.error('Failed to reprocess with new settings:', error)
        toast.error('Failed to apply settings')
      } finally {
        setIsReprocessing(false)
      }
    },
    [refreshPalette]
  )

  const onGridSizeChange = useCallback(
    async (newSize: number) => {
      setCurrentGridSize(newSize)
      setIsReprocessing(true)
      try {
        await editorRef.current?.getEditor()?.setGridSizeAndReload(newSize)
        setHasUnsavedChanges(true)
        refreshPalette()
      } catch (error) {
        console.error('Failed to change grid size:', error)
        toast.error('Failed to change grid size')
      } finally {
        setIsReprocessing(false)
      }
    },
    [refreshPalette]
  )

  return (
    <div id={`canvas-${pixel.id}`} className={cn(sharedClasses, 'h-fit')}>
      {/* Canvas */}
      <div
        className={cn(
          'flex items-center justify-center',
          'border-3 border-shadow border-r-background border-b-background',
          'aspect-square bg-white',
          'w-full h-auto md:w-auto md:self-start'
        )}
      >
        {pixelVersion?.fileKey ? (
          <HtmlCanvasWithRef
            id={pixel.id}
            fileKey={pixelVersion.fileKey}
            gridSize={pixelVersion.gridSize}
            gridSettings={pixelVersion.gridSettings}
            ref={editorRef}
            onHistoryChange={onHistoryChange}
            onLoadingChange={onInitialLoadingChange}
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
              <TooltipWrapper content='Size'>
                <PenSize
                  className='size-11! flex items-center justify-center'
                  onChange={(size: number) =>
                    editorRef.current?.getEditor()?.setToolSize(size)
                  }
                />
              </TooltipWrapper>
              <TooltipWrapper content='Pen (P)'>
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
              <TooltipWrapper content='Fill (B)'>
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
              <TooltipWrapper content='Eraser (E)'>
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
              <TooltipWrapper content='Line (L)'>
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
              <TooltipWrapper content='Eyedropper (I)'>
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
              <TooltipWrapper content='Grid (G)'>
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
              <TooltipWrapper content='Undo (⌘Z)'>
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
              <TooltipWrapper content='Redo (⇧⌘Z)'>
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
              {!isOnPixelPage && (
                <TooltipWrapper content='Open in Studio'>
                  <ButtonLink
                    aria-label='Open in Full Page'
                    iconOnly
                    className='size-11!'
                    href={`/p/${pixel.id}`}
                    disabled={disableActions}
                  >
                    <ExpandIcon
                      width={20}
                      height={20}
                      className={cn(disableActions && 'opacity-50')}
                    />
                  </ButtonLink>
                </TooltipWrapper>
              )}
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

                      const currentGridSize =
                        editorRef.current?.getEditor()?.getGridSize() ?? 32
                      const currentSettings =
                        editorRef.current?.getEditor()?.getGridSettings()

                      await savePixel({
                        id: pixel.id,
                        version: pixelVersion?.version,
                        oldFileKey: pixelVersion?.fileKey,
                        svgContent,
                        gridSize: currentGridSize,
                        gridSettings: currentSettings,
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

        {/* Palette */}
        <Palette
          colors={palette}
          selectedColor={rgbaColor}
          onColorSelect={onColorChange}
          disabled={disableActions}
        />

        {/* Grid Settings Panel */}
        <GridSettingsPanel
          settings={gridSettings}
          gridSize={currentGridSize}
          onSettingsChange={onGridSettingsChange}
          onGridSizeChange={onGridSizeChange}
          disabled={disableActions || isReprocessing || isInitialLoading}
          isSvgMode={pixelVersion?.fileKey?.endsWith('.svg') ?? false}
        />

        {isInitialLoading && (
          <p className='bg-background pixel-corners text-center text-xs py-0.5 animate-pulse'>
            Loading...
          </p>
        )}

        {isReprocessing && !isInitialLoading && (
          <p className='bg-background pixel-corners text-center text-xs py-0.5 animate-pulse'>
            Reprocessing...
          </p>
        )}

        {hasUnsavedChanges && !isReprocessing && !isInitialLoading && (
          <p className='bg-background pixel-corners text-center text-xs py-0.5'>
            You have unsaved changes
          </p>
        )}

        <p className='text-center text-xs text-shadow leading-tight'>
          Subtle imperfections are expected when mapping to the grid-based
          editor
        </p>
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

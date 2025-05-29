'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getQuantizer } from './quant'
import { Color } from './renderer'
import { analyzeGridCell } from './utils'

interface DebugViewProps {
  svgUrl: string
  onError?: (error: Error) => void
}

interface GridCoordinate {
  x: number
  y: number
}

const DEFAULT_GRID_SIZE = 36
const DISPLAY_PIXEL_SIZE = 10
const IMAGE_SIZE = 800

interface Settings {
  gridSize: number
  alphaThreshold: number // 0-255
  fillThreshold: number // Minimum percentage of non-transparent pixels to render (0-100)
  showDebugInfo: boolean // Show debug information like fill percentage
  showGrid: boolean // Toggle grid visibility
  showCoordinates: boolean
}

interface ColorMapEntry {
  count: number
  color: Color
}

interface DebugInfo {
  colorFrequency: Map<string, ColorMapEntry>
  processedPixels: number
  duration: number
}

function SVGDebugView({ svgUrl, onError }: DebugViewProps) {
  const debugCanvasRef = useRef<HTMLCanvasElement>(null)
  const debugOverlayRef = useRef<HTMLCanvasElement>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement>(null)
  const resultOverlayRef = useRef<HTMLCanvasElement>(null)

  const [settings, setSettings] = useState<Settings>({
    gridSize: DEFAULT_GRID_SIZE,
    alphaThreshold: 0.5,
    fillThreshold: 40,
    showDebugInfo: false,
    showGrid: true,
    showCoordinates: false,
  })
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    duration: 0,
    colorFrequency: new Map<string, ColorMapEntry>(),
    processedPixels: 0,
  })
  const [hoverCoord, setHoverCoord] = useState<GridCoordinate>()
  const [lockedCoord, setLockedCoord] = useState<GridCoordinate>()
  const [quantizedData, setQuantizedData] = useState<
    number[] | Uint8Array<ArrayBufferLike> | null
  >(null)
  const lockedCoordinatesData = useMemo(() => {
    if (!lockedCoord || !quantizedData) return null
    return analyzeGridCell({
      quantizedData: quantizedData as Uint8Array,
      width: IMAGE_SIZE,
      startX: (lockedCoord.x * IMAGE_SIZE) / settings.gridSize,
      startY: (lockedCoord.y * IMAGE_SIZE) / settings.gridSize,
      regionSize: IMAGE_SIZE / settings.gridSize,
      alphaThreshold: settings.alphaThreshold,
    })
  }, [lockedCoord, quantizedData, settings.alphaThreshold, settings.gridSize])

  useEffect(() => {
    const scale = window.devicePixelRatio || 1
    const displaySize = settings.gridSize * DISPLAY_PIXEL_SIZE

    const overlayRefs = [debugOverlayRef, resultOverlayRef]
    overlayRefs.forEach((ref) => {
      const overlay = ref.current
      if (!overlay) return

      overlay.width = displaySize * scale
      overlay.height = displaySize * scale
      overlay.style.width = `${displaySize}px`
      overlay.style.height = `${displaySize}px`
      overlay.style.position = 'absolute'
      overlay.style.pointerEvents = 'none'
      overlay.style.top = '0'
      overlay.style.left = '0'
    })
  }, [settings.gridSize])

  const processImage = React.useCallback(() => {
    const debugCanvas = debugCanvasRef.current
    const resultCanvas = resultCanvasRef.current

    if (!debugCanvas || !resultCanvas) return

    const debugCtx = debugCanvas.getContext('2d', { willReadFrequently: true })
    const resultCtx = resultCanvas.getContext('2d', {
      willReadFrequently: true,
    })
    if (!debugCtx || !resultCtx) return

    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      console.log('[Processing image]', image.width, 'x', image.height)

      const size = IMAGE_SIZE
      image.width = size
      image.height = size

      const displaySize = settings.gridSize * DISPLAY_PIXEL_SIZE

      // Calculate how much of the original image each grid cell represents
      const samplingSize = size / settings.gridSize

      const canvases = [debugCanvas, resultCanvas]
      canvases.forEach((canvas) => {
        canvas.width = displaySize
        canvas.height = displaySize
        canvas.style.width = `${displaySize}px`
        canvas.style.height = `${displaySize}px`

        const context = canvas.getContext('2d')
        if (context) {
          context.imageSmoothingEnabled = false
          context.clearRect(0, 0, displaySize, displaySize)
        }
      })

      // Draw original image scaled to fit canvas
      debugCtx.drawImage(image, 0, 0, displaySize, displaySize)

      // Draw grid on debug canvas
      if (settings.showGrid) {
        debugCtx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
        for (let x = 0; x < settings.gridSize; x++) {
          for (let y = 0; y < settings.gridSize; y++) {
            debugCtx.strokeRect(
              x * DISPLAY_PIXEL_SIZE,
              y * DISPLAY_PIXEL_SIZE,
              DISPLAY_PIXEL_SIZE,
              DISPLAY_PIXEL_SIZE
            )
          }
        }
      }

      // Create a temporary canvas for sampling:
      const sampleCanvas = document.createElement('canvas')
      sampleCanvas.width = size
      sampleCanvas.height = size
      const sampleCtx = sampleCanvas.getContext('2d', {
        willReadFrequently: true,
      })
      if (!sampleCtx) return
      sampleCtx.drawImage(image, 0, 0, size, size)

      const q = getQuantizer()
      q.sample(sampleCanvas)
      const quantized = q.reduce(sampleCanvas)
      setQuantizedData(quantized)

      const quantizedImageData = sampleCtx.createImageData(size, size)
      quantizedImageData.data.set(quantized)
      sampleCtx.putImageData(quantizedImageData, 0, 0)

      const colorFrequencies = new Map<string, ColorMapEntry>()
      let processedPixels = 0

      const startTime = performance.now()

      for (let x = 0; x < settings.gridSize; x++) {
        for (let y = 0; y < settings.gridSize; y++) {
          const { filledPixels, totalPixels, colorMap } = analyzeGridCell({
            width: size,
            startX: x * samplingSize,
            startY: y * samplingSize,
            regionSize: samplingSize,
            alphaThreshold: settings.alphaThreshold,
            quantizedData: quantized,
          })

          const filledPercentage = (filledPixels / totalPixels) * 100

          if (filledPercentage < settings.fillThreshold) {
            continue
          }

          const dominantColor = findDominantColor(colorMap)

          if (dominantColor) {
            if (resultCtx) {
              const color = `rgba(${dominantColor.join(',')})`

              if (colorFrequencies.has(color)) {
                const entry = colorFrequencies.get(color)
                if (entry) entry.count++
              } else {
                colorFrequencies.set(color, {
                  count: 1,
                  color: dominantColor,
                })
              }

              resultCtx.fillStyle = color
              resultCtx.fillRect(
                x * DISPLAY_PIXEL_SIZE,
                y * DISPLAY_PIXEL_SIZE,
                DISPLAY_PIXEL_SIZE,
                DISPLAY_PIXEL_SIZE
              )
              processedPixels++
            }
          }
        }
      }

      const duration = performance.now() - startTime

      setDebugInfo((prev) => ({
        ...prev,
        duration,
        colorFrequencies,
        processedPixels,
      }))

      console.log('[Processing complete] ', `${duration}ms`)
    }

    image.onerror = (err) => {
      console.error('[Failed to load image]', err)
      onError?.(new Error('Failed to load SVG image'))
    }

    image.src = svgUrl
  }, [svgUrl, settings, onError])

  useEffect(() => processImage(), [processImage])

  useEffect(() => {
    if (!debugCanvasRef.current || !svgUrl) return

    // Set canvas sizes based on grid size and display pixel size
    const canvasSize = settings.gridSize * DISPLAY_PIXEL_SIZE
    const scale = window.devicePixelRatio || 1

    // Initialize all canvases with proper sizing
    const initCanvas = (canvas: HTMLCanvasElement) => {
      canvas.width = canvasSize * scale
      canvas.height = canvasSize * scale
      canvas.style.width = `${canvasSize}px`
      canvas.style.height = `${canvasSize}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(scale, scale)
        ctx.imageSmoothingEnabled = false
      }
    }

    const canvases = [debugCanvasRef.current, resultCanvasRef.current]
    canvases.forEach((canvas) => {
      if (canvas) initCanvas(canvas)
    })
  }, [settings.gridSize, svgUrl])

  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!settings.showCoordinates || lockedCoord) return

    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / DISPLAY_PIXEL_SIZE)
    const y = Math.floor((event.clientY - rect.top) / DISPLAY_PIXEL_SIZE)

    if (x >= 0 && x < settings.gridSize && y >= 0 && y < settings.gridSize) {
      setHoverCoord({ x, y })
    } else {
      setHoverCoord(undefined)
    }
  }

  const handleCanvasMouseLeave = () => {
    if (!settings.showCoordinates) return
    if (!lockedCoord) setHoverCoord(undefined)
  }

  const handleCanvasClick = () => {
    if (hoverCoord) {
      setLockedCoord(lockedCoord ? undefined : hoverCoord)
    }
  }

  useEffect(() => {
    const coord = hoverCoord || lockedCoord
    if (!coord || !settings.showCoordinates) return

    const overlayRefs = [debugOverlayRef, resultOverlayRef]
    overlayRefs.forEach((ref) => {
      const overlay = ref.current
      if (!overlay) return

      const ctx = overlay.getContext('2d')
      if (!ctx) return

      const scale = window.devicePixelRatio || 1

      // Clear previous highlights
      ctx.clearRect(0, 0, overlay.width, overlay.height)

      ctx.save()
      ctx.scale(scale, scale)

      // Draw highlight rectangle
      ctx.strokeStyle = lockedCoord
        ? 'rgba(255, 165, 0, 0.8)'
        : 'rgba(255, 255, 0, 0.8)'
      ctx.lineWidth = 2
      ctx.strokeRect(
        coord.x * DISPLAY_PIXEL_SIZE,
        coord.y * DISPLAY_PIXEL_SIZE,
        DISPLAY_PIXEL_SIZE,
        DISPLAY_PIXEL_SIZE
      )

      // Draw coordinate tooltip
      const tooltipHeight = 20
      const tooltipWidth = 60
      const tooltipY = Math.max(0, coord.y * DISPLAY_PIXEL_SIZE - tooltipHeight)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(
        coord.x * DISPLAY_PIXEL_SIZE,
        tooltipY,
        tooltipWidth,
        tooltipHeight
      )

      ctx.fillStyle = 'white'
      ctx.font = '12px monospace'
      ctx.fillText(
        `${coord.x},${coord.y}`,
        coord.x * DISPLAY_PIXEL_SIZE + 5,
        tooltipY + 14
      )

      ctx.restore()
    })
  }, [hoverCoord, lockedCoord, settings.showCoordinates, settings.gridSize])

  return (
    <div className='flex flex-col gap-4 p-4 bg-gray-100 rounded-lg'>
      {/* Settings Panel */}
      <div className='bg-white p-4 rounded-lg shadow'>
        <h3 className='font-medium mb-3'>Settings</h3>
        <div className='grid grid-cols-4 gap-4 mb-4'>
          {/* Grid Size */}
          <label className='flex flex-col'>
            Grid Size
            <input
              type='number'
              min='5'
              max='50'
              value={settings.gridSize}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  gridSize: parseInt(e.target.value),
                }))
              }
            />
          </label>
          {/* Alpha Threshold */}
          <label className='flex flex-col'>
            Alpha Threshold
            <input
              type='range'
              min='0'
              max='255'
              value={settings.alphaThreshold}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  alphaThreshold: parseInt(e.target.value),
                }))
              }
            />
            <span className='text-sm text-gray-500'>
              {settings.alphaThreshold}
            </span>
          </label>
          {/* Fill Threshold */}
          <label className='flex flex-col'>
            Fill Threshold
            <input
              type='range'
              min='0'
              max='100'
              value={settings.fillThreshold}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  fillThreshold: parseInt(e.target.value),
                }))
              }
            />
            <span className='text-sm text-gray-500'>
              {settings.fillThreshold}%
            </span>
          </label>
        </div>
        <div className='flex gap-4 mt-2'>
          {/* Show Debug Info */}
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showDebugInfo}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  showDebugInfo: e.target.checked,
                }))
              }
            />
            <span className='text-sm'>Show Debug Info</span>
          </label>
          {/* Show Grid */}
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showGrid}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  showGrid: e.target.checked,
                }))
              }
            />
            <span className='text-sm'>Show Grid</span>
          </label>
          {/* Show Coordinates */}
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={settings.showCoordinates}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  showCoordinates: e.target.checked,
                }))
              }
            />
            <span className='text-sm'>Show Coordinates</span>
          </label>
          {settings.showCoordinates && (
            <button
              onClick={() => setLockedCoord(undefined)}
              className={`px-3 py-1 rounded ${
                lockedCoord
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {lockedCoord ? 'Unlock Position' : 'Click to Lock Position'}
            </button>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {settings.showDebugInfo && (
        <div className='bg-white p-4 rounded-lg shadow mb-4 flex gap-8 justify-center text-sm text-gray-600'>
          <div className='flex gap-2 items-center'>
            <div className='flex flex-col items-center'>
              <span>{debugInfo.colorFrequency.size} total colors</span>
              <span>{debugInfo.processedPixels} processed pixels</span>
            </div>
          </div>
        </div>
      )}

      {/* Locked Coordinates */}
      {lockedCoord && (
        <div className='bg-white p-4 rounded-lg shadow mb-4 flex gap-8 text-sm text-gray-600'>
          <div className='flex gap-2 items-center'>
            <div className='flex gap-8'>
              <div className='flex flex-col gap-2'>
                <p>Colors:</p>
                {Array.from(lockedCoordinatesData?.colorMap.values() || []).map(
                  (entry) => (
                    <div
                      key={entry.color.join(',')}
                      className='flex gap-2 items-center'
                    >
                      <div
                        className='w-2 h-2'
                        style={{
                          backgroundColor: `rgba(${entry.color.join(',')})`,
                        }}
                      />
                      {entry.color.join(',')} ({entry.count})
                    </div>
                  )
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <span>
                  Coordinates: ({lockedCoord.x}, {lockedCoord.y})
                </span>
                <span>Total Pixels: {lockedCoordinatesData?.totalPixels}</span>
                <span>
                  Filled Pixels: {lockedCoordinatesData?.filledPixels} (
                  {(
                    ((lockedCoordinatesData?.filledPixels || 0) /
                      (lockedCoordinatesData?.totalPixels || 1)) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Display */}
      <div className='flex flex-col gap-8'>
        {/* First row: Original + Grid and Source */}
        <div className='flex gap-8 justify-center'>
          <div className='flex flex-col items-center'>
            <h3 className='text-sm font-medium mb-2'>Original + Grid</h3>
            <div className='relative'>
              <canvas
                ref={debugCanvasRef}
                className='border border-gray-300 bg-white'
                style={{
                  cursor: settings.showCoordinates ? 'crosshair' : 'default',
                }}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                onClick={handleCanvasClick}
              />
              <canvas
                ref={debugOverlayRef}
                className='absolute top-0 left-0 pointer-events-none'
              />
            </div>
          </div>
          {/* Result */}
          <div className='flex flex-col items-center'>
            <h3 className='text-sm font-medium mb-2'>
              Result
              {debugInfo.duration
                ? ` (${debugInfo.duration.toFixed(1)}ms)`
                : undefined}
            </h3>
            <div className='relative'>
              <canvas
                ref={resultCanvasRef}
                className='border border-gray-300 bg-white'
                style={{
                  cursor: settings.showCoordinates ? 'crosshair' : 'default',
                }}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                onClick={handleCanvasClick}
              />
              <canvas
                ref={resultOverlayRef}
                className='absolute top-0 left-0 pointer-events-none'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SVGDebugViewWrapper() {
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'image/svg+xml') {
      try {
        const url = URL.createObjectURL(file)
        console.log('Created URL:', url)
        setSvgUrl(url)
        setError(null)
      } catch (err) {
        setError('Failed to load SVG file')
        console.error('File load error:', err)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'image/svg+xml') {
      try {
        const url = URL.createObjectURL(file)
        console.log('Created URL from drop:', url)
        setSvgUrl(url)
        setError(null)
      } catch (err) {
        setError('Failed to load dropped SVG file')
        console.error('Drop error:', err)
      }
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {!svgUrl ? (
        <div
          className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type='file'
            ref={fileInputRef}
            accept='.svg'
            onChange={handleFileChange}
            className='hidden'
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Upload SVG
          </button>
          <p className='mt-2 text-gray-500'>
            or drag and drop an SVG file here
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <div className='text-sm'>
              Loaded SVG URL:{' '}
              <code className='bg-gray-100 px-2 py-1 rounded'>{svgUrl}</code>
            </div>
            <button
              onClick={() => {
                URL.revokeObjectURL(svgUrl)
                setSvgUrl(null)
                setError(null)
              }}
              className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
            >
              Clear
            </button>
          </div>

          <SVGDebugView
            svgUrl={svgUrl}
            onError={(err) => {
              console.error('Debug view error:', err)
              setError('Failed to process SVG in debug view')
            }}
          />
        </div>
      )}

      {error && <div className='text-red-500 text-sm'>{error}</div>}
    </div>
  )
}

function findDominantColor(colorMap: Map<string, ColorMapEntry>): Color | null {
  let dominantColor: Color | null = null
  let maxCount = 0
  for (const entry of Array.from(colorMap.values())) {
    if (entry.count > maxCount) {
      maxCount = entry.count
      dominantColor = entry.color
    }
  }

  return dominantColor
}

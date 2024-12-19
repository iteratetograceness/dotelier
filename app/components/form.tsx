'use client'

import { useState, useTransition } from 'react'
import Compact from '@uiw/react-color-compact'
import { WindowCard } from './window'
import { Button } from './button'
import { toast } from 'sonner'

interface ColorResult {
  rgb: {
    r: number
    g: number
    b: number
  }
  hex: string
}

export function PixelGenerator({
  draggable,
  positions,
}: {
  draggable: boolean
  positions: Record<string, { x: number; y: number }>
}) {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [colorPicker, setColorPicker] = useState<boolean>(false)
  const [activeColor, setActiveColor] = useState<string>()
  const [colors, setColors] = useState<ColorResult[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    startTransition(async () => {
      const formData = new FormData(e.currentTarget)
      if (!formData.get('prompt')) {
        setError('Missing input')
        return
      }

      formData.set('colors', encodeColors(colors))

      const response = await fetch('/api/pixelate', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if ('error' in data) {
        setError(data.error)
        return
      }

      if (
        'images' in data &&
        Array.isArray(data.images) &&
        data.images.length > 0
      ) {
        setUrl(data.images[0].url)
        return
      }

      setError('Failed to generate icon. Please try again.')
    })
  }

  return (
    <div className='flex flex-col lg:flex-row gap-8 items-center lg:items-start'>
      <div className='flex flex-col md:flex-row gap-8'>
        <WindowCard
          className='w-[300px]'
          title='INPUT'
          id='input'
          draggable={draggable && !isPending}
          position={positions.input}
        >
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <textarea
              className='w-full border border-shadow bg-background text-foreground p-2 focus:outline-none resize-y min-h-44 h-44 max-h-80 uppercase'
              id='prompt'
              name='prompt'
              placeholder='A carrot sonny angel'
            />

            <div className='flex flex-col w-full gap-2 justify-end'>
              <Button
                disabled={isPending}
                type='button'
                onClick={() => setColorPicker(true)}
                className='w-full'
              >
                CHOOSE COLOR SCHEME
              </Button>
              <Button disabled={isPending} type='submit' className='w-full'>
                {isPending ? 'GENERATING' : 'GENERATE'}
              </Button>
              <Button type='reset' className='w-full'>
                CLEAR
              </Button>
            </div>
          </form>
        </WindowCard>
        {colorPicker ? (
          <WindowCard
            className='w-[231px] h-fit min-h-[200px]'
            title='COLORS'
            id='colors'
            draggable={draggable && !isPending}
            position={positions.colors}
            closeable={false}
          >
            <div className='flex flex-col gap-4'>
              <Compact
                style={{
                  width: '100%',
                }}
                color={activeColor}
                onChange={(color, e) => {
                  e?.preventDefault()
                  e?.stopPropagation()
                  setColors((prev) => {
                    if (prev.some((c) => c.hex === color.hex)) {
                      return prev.filter((c) => c.hex !== color.hex)
                    }
                    return [...prev, color]
                  })
                  setActiveColor(color.hex)
                }}
              />
              <div className='flex flex-col gap-2'>
                <span className='text-xs text-muted-foreground'>SELECTED:</span>
                <div className='flex flex-wrap gap-[5px]'>
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      type='button'
                      onClick={() => {
                        setColors(colors.filter((c) => c.hex !== color.hex))
                      }}
                    >
                      <div
                        className='size-[15px] rounded-[2px]'
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className='flex gap-2 justify-end'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    setColors([])
                    setActiveColor(undefined)
                  }}
                >
                  Reset
                </Button>
                <Button
                  type='button'
                  onClick={() => {
                    setColors([])
                    setActiveColor(undefined)
                    setColorPicker(false)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </WindowCard>
        ) : null}
      </div>

      <WindowCard
        className='size-[300px] sm:size-[400px]'
        title='OUTPUT'
        id='output'
        draggable={draggable && !isPending}
        position={positions.output}
        closeable={false}
      >
        {url ? <PixelImage src={url} /> : <EmptyState error={error} />}
      </WindowCard>
    </div>
  )
}

function PixelImage({ src }: { src: string }) {
  const onDownload = async (src: string) => {
    try {
      const response = await fetch(src)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const blobWithType = new Blob([blob], { type: 'image/svg+xml' })
      const url = window.URL.createObjectURL(blobWithType)

      const link = document.createElement('a')
      link.href = url
      link.download = 'my-pixel-icon.svg'

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error(error)
      toast.error('Failed to download image. Please try again.')
    }
  }

  return (
    <div className='flex flex-col items-center flex-1  h-full'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className='flex-1'
        src={src}
        alt='pixelated icon'
        width={150}
        height={150}
      />
      <div className='flex gap-2 self-end'>
        <Button
          type='button'
          variant='secondary'
          onClick={() => onDownload(src)}
        >
          Download
        </Button>
      </div>
    </div>
  )
}

// TODO: Generating animation
function EmptyState({ error }: { error: string | null }) {
  return (
    <div className='flex items-center flex-1 justify-center h-full'>
      {error ? (
        <span className='text-red-300'>{error}</span>
      ) : (
        '[ ICON WILL APPEAR HERE ]'
      )}
    </div>
  )
}

function encodeRgb(rgb: { r: number; g: number; b: number }) {
  return `${rgb.r}/${rgb.g}/${rgb.b}`
}

function encodeColors(colors: ColorResult[]) {
  return colors.map((c) => encodeRgb(c.rgb)).join(',')
}

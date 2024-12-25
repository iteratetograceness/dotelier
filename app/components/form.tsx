'use client'

import { Dispatch, SetStateAction, useActionState, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import Compact from '@uiw/react-color-compact'
import { Button } from './button'
import { toast } from 'sonner'
import RetroLoader from './loader'
import SadFace from '../icons/sad-face'
import { BaseWindow } from './window/base'
import Plus from '../icons/plus'
import X from '../icons/x'

interface FormState {
  url?: string
  error?: string
}

export function PixelGenerator() {
  const [state, dispatch, isPending] = useActionState<FormState, FormData>(
    generate,
    {
      url: undefined,
      error: undefined,
    }
  )
  const [colors, setColors] = useState<ColorResult[]>([])

  return (
    <main className='min-w-screen flex flex-col md:flex-row gap-8 items-center justify-center p-10 pointer-events-auto'>
      <BaseWindow className='w-full md:w-[500px]' title='input'>
        <form className='flex flex-col gap-4'>
          <textarea
            className='w-full border border-shadow bg-background text-foreground p-2 focus:outline-none resize-y min-h-44 h-44 max-h-80 uppercase'
            id='prompt'
            name='prompt'
            placeholder='A carrot sonny angel'
          />
          <input type='hidden' name='colors' value={encodeColors(colors)} />
          <Colors colors={colors} setColors={setColors} />
          <div className='flex w-full gap-2'>
            <Button type='reset'>CLEAR</Button>
            <Button
              className='w-full'
              variant='secondary'
              disabled={isPending}
              formAction={dispatch}
            >
              {isPending ? 'GENERATING' : 'GENERATE'}
            </Button>
          </div>
        </form>
      </BaseWindow>

      <BaseWindow className='w-full aspect-square md:w-[500px]' title='output'>
        {state.url ? (
          <PixelImage src={state.url} />
        ) : (
          <EmptyState error={state.error} pending={isPending} />
        )}
      </BaseWindow>
    </main>
  )
}

async function generate(previousState: FormState, formData: FormData) {
  if (!formData.get('prompt')) {
    return {
      error: 'Input is required',
    }
  }

  const colors = formData.get('colors')
  if (colors) {
    // formData.set('colors', encodeColors(colors))
  }

  const response = await fetch('/api/pixelate', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if ('error' in data) {
    return {
      error: data.error,
    }
  }

  if (
    'images' in data &&
    Array.isArray(data.images) &&
    data.images.length > 0
  ) {
    return {
      url: data.images[0].url,
    }
  }

  return {
    error: 'Failed to generate icon. Please try again.',
  }
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

// TODO: Empty state:
function EmptyState({ error, pending }: { error?: string; pending: boolean }) {
  return (
    <div className='flex items-center flex-1 justify-center h-full uppercase'>
      {pending ? <RetroLoader /> : null}
      {error ? <ErrorState error={error} /> : null}
      {!pending && !error ? <p>Empty</p> : null}
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className='flex flex-col items-center gap-7'>
      <div className='text-foreground'>
        <SadFace />
      </div>
      <div className='flex items-center flex-col gap-2'>
        <p className='text-xl font-bold'>something went wrong</p>
        <p className='text-sm text-amber-600 dark:text-amber-400'>{error}</p>
      </div>
    </div>
  )
}

function AddColorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className='flex items-center justify-center border-shadow border-2 p-2 size-10 shrink-0 text-shadow'
      aria-label='Add color'
      type='button'
      onClick={onClick}
    >
      <Plus />
    </button>
  )
}

interface ColorResult {
  rgb: {
    r: number
    g: number
    b: number
  }
  hex: string
}

function Colors({
  colors,
  setColors,
}: {
  colors: ColorResult[]
  setColors: Dispatch<SetStateAction<ColorResult[]>>
}) {
  return (
    <div className='flex flex-col gap-2 px-1 pb-3'>
      <p className='uppercase'>Colors</p>
      <div className='flex flex-wrap gap-2 items-center'>
        {colors.map((color, i) => (
          <ColorPicker
            key={`${color.hex}-${i}`}
            color={color}
            removeColor={() => {
              setColors((prev) => prev.filter((_, index) => index !== i))
            }}
            setColor={(color) => {
              setColors((prev) => {
                const newColors = [...prev]
                newColors[i] = color
                return newColors
              })
            }}
          />
        ))}

        <AddColorButton
          onClick={() =>
            setColors((prev) => [
              ...prev,
              { rgb: { r: 0, g: 0, b: 0 }, hex: '#000000' },
            ])
          }
        />
      </div>
    </div>
  )
}

function ColorPicker({
  color,
  setColor,
  removeColor,
}: {
  color: ColorResult
  setColor: (color: ColorResult) => void
  removeColor: () => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className='relative group'>
          <button
            className='size-10 border-2 p-2 border-shadow shrink-0'
            style={{ backgroundColor: color.hex }}
            type='button'
            aria-label={`Current color is #${color.hex}. Click to change.`}
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeColor()
            }}
            className='absolute -top-1 -right-1 size-4 bg-background border-2 border-shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
            aria-label='Remove color'
            type='button'
          >
            <X />
          </button>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='bg-background p-4 border-2 border-shadow'
          sideOffset={5}
          align='start'
        >
          <Compact
            style={{
              backgroundColor: 'inherit',
              color: 'inherit',
              padding: 0,
              marginLeft: 5,
              marginTop: 5,
            }}
            color={color.hex}
            onChange={(result) => setColor(result)}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function encodeRgb(rgb: { r: number; g: number; b: number }) {
  return `${rgb.r}/${rgb.g}/${rgb.b}`
}

function encodeColors(colors: ColorResult[]) {
  return colors.map((c) => encodeRgb(c.rgb)).join(',')
}

{
  /* {colorPicker ? (
          <BaseWindow
            className='w-[231px] h-fit min-h-[200px]'
            title='COLORS'
            id='colors'
          >
            <div className='flex flex-col gap-4'>
              
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
          </BaseWindow>
        ) : null} */
}

'use client'

import { useActionState, useCallback, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import Compact from '@uiw/react-color-compact'
import { Button, ButtonLink } from './button'
import { toast } from 'sonner'
import RetroLoader from './loader'
import SadFace from '../icons/sad-face'
import { BaseWindow } from './window/base'
import Plus from '../icons/plus'
import X from '../icons/x'
import { Tangerine } from '../icons/tangerine'
import { generateIcon, FormState } from './form-action'
import { ColorMap, ColorResult, encodeColors } from '../utils/colors'
import { ErrorCode, getError } from '@/lib/error'
import Image from 'next/image'

export function PixelGenerator() {
  const [state, dispatch, isPending] = useActionState<FormState, FormData>(
    generateIcon,
    {
      image: undefined,
      error: undefined,
    }
  )

  const [colors, setColors] = useState<ColorMap>(new Map())

  const addNewColor = useCallback(() => {
    setColors((prev) => {
      const newMap = new Map(prev)
      newMap.set(newMap.size, {
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
      })
      return newMap
    })
  }, [])

  const updateColor = useCallback((index: number, color: ColorResult) => {
    setColors((prev) => {
      const newMap = new Map(prev)
      newMap.set(index, color)
      return newMap
    })
  }, [])

  const removeColor = useCallback((index: number) => {
    setColors((prev) => {
      const newMap = new Map(prev)
      newMap.delete(index)
      return newMap
    })
  }, [])

  const resetForm = useCallback(() => {
    setColors(new Map())
  }, [])

  return (
    <main className='min-w-screen flex flex-col md:flex-row gap-8 items-center justify-center p-10 pointer-events-auto'>
      <BaseWindow className='w-full md:w-[500px]' title='input' id='input'>
        <form className='flex flex-col gap-4'>
          <textarea
            className='w-full border border-foreground bg-background text-foreground p-2 focus:outline-none resize-y min-h-44 h-44 max-h-80'
            id='prompt'
            name='prompt'
            placeholder='A carrot sonny angel'
          />
          <input type='hidden' name='colors' value={encodeColors(colors)} />
          <Colors
            colors={colors}
            addNewColor={addNewColor}
            updateColor={updateColor}
            removeColor={removeColor}
          />
          <div className='flex w-full gap-2'>
            <Button type='reset' onClick={resetForm}>
              clear
            </Button>
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

      <BaseWindow
        className='w-full aspect-square md:w-[400px]'
        title='output'
        id='output'
      >
        <Output image={state.image} error={state.error} pending={isPending} />
      </BaseWindow>
    </main>
  )
}

function Output({
  image,
  error,
  pending,
}: {
  image?: string
  error?: ErrorCode
  pending: boolean
}) {
  if (pending) return <Pending />
  if (image) return <PixelImage base64={image} />
  if (error) return <ErrorState error={error} />
  return <EmptyState />
}

function PixelImage({ base64 }: { base64: string }) {
  const onDownload = useCallback(async (imageData: string) => {
    try {
      const response = await fetch(imageData)

      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()
      const blobWithType = new Blob([blob], { type: 'image/png' })
      const url = window.URL.createObjectURL(blobWithType)

      const link = document.createElement('a')
      link.href = url
      link.download = 'my-pixel-icon.png'

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch {
      toast.error('Failed to download image. Please try again.')
    }
  }, [])

  return (
    <div className='flex flex-col gap-4 items-center flex-1 h-full'>
      <div className='flex-1 w-full relative aspect-square border-[2px] border-shadow border-r-highlight border-b-highlight'>
        <Image
          className='object-contain'
          src={`data:image/png;base64,${base64}`}
          alt='pixelated icon'
          fill
          quality={100}
        />
      </div>
      <div className='flex gap-2 w-full'>
        <ButtonLink
          type='button'
          className='flex-1 text-center'
          href={`/atelier`}
          variant='secondary'
        >
          View All
        </ButtonLink>
        <Button
          className='flex-1'
          type='button'
          variant='secondary'
          onClick={() => onDownload(`data:image/png;base64,${base64}`)}
        >
          Download
        </Button>
      </div>
    </div>
  )
}

function Pending() {
  return (
    <div className='flex items-center flex-1 justify-center h-full'>
      <RetroLoader />
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center flex-1 justify-center h-full gap-4'>
      <div className='size-[100px] flex items-center justify-center'>
        <Tangerine />
      </div>
      <p className='text-center'>
        Nothing to see here.
        <br />
        Try entering a prompt.
      </p>
    </div>
  )
}

function ErrorState({ error }: { error: ErrorCode }) {
  return (
    <div className='flex flex-col items-center gap-7 justify-center h-full'>
      <div className='text-foreground'>
        <SadFace />
      </div>
      <div className='flex items-center flex-col gap-2'>
        <p className='text-xl font-bold'>something went wrong</p>
        <p className='text-sm text-amber-600 dark:text-amber-400'>
          {getError(error)}
        </p>
      </div>
    </div>
  )
}

function AddColorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className='flex items-center justify-center border-foreground border-2 p-2 size-10 shrink-0 text-foreground'
      aria-label='Add color'
      type='button'
      onClick={onClick}
    >
      <Plus />
    </button>
  )
}

function Colors({
  colors,
  addNewColor,
  updateColor,
  removeColor,
}: {
  colors: ColorMap
  addNewColor: () => void
  updateColor: (index: number, color: ColorResult) => void
  removeColor: (index: number) => void
}) {
  return (
    <div className='flex flex-col gap-2 px-1 pb-3'>
      <p>Colors</p>
      <div className='flex flex-wrap gap-2 items-center'>
        {Array.from(colors.entries()).map(([index, color]) => (
          <ColorPicker
            key={`${color.hex}-${index}`}
            initialColor={color}
            removeColor={() => removeColor(index)}
            updateColor={(color) => updateColor(index, color)}
          />
        ))}
        <AddColorButton onClick={addNewColor} />
      </div>
    </div>
  )
}

function ColorPicker({
  initialColor,
  updateColor,
  removeColor,
}: {
  initialColor: ColorResult
  updateColor: (color: ColorResult) => void
  removeColor: () => void
}) {
  const [color, setColor] = useState<ColorResult>(initialColor)

  const finalizeColorChange = useCallback(
    (open: boolean) => {
      if (!open) updateColor(color)
    },
    [color, updateColor]
  )

  return (
    <Popover.Root onOpenChange={finalizeColorChange}>
      <Popover.Trigger asChild>
        <div className='relative group'>
          <button
            className='size-10 border-2 p-2 border-foreground shrink-0'
            style={{ backgroundColor: color.hex }}
            type='button'
            aria-label={`Current color is #${color.hex}. Click to change.`}
          />
          <button
            onClick={removeColor}
            className='absolute -top-1 -right-1 size-4 bg-background border-2 border-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
            aria-label='Remove color'
            type='button'
          >
            <X />
          </button>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='bg-background border-2 border-foreground p-[13px] pr-0 pb-2'
          sideOffset={5}
          align='start'
        >
          <Compact
            style={{
              backgroundColor: 'inherit',
              color: 'inherit',
              padding: 0,
            }}
            color={color.hex}
            onChange={(result) => setColor(result)}
            rectRender={(props) => (
              <div
                {...props}
                className='size-6 mr-[5px] mb-[5px] cursor-pointer relative outline-none flex items-center justify-center'
                style={{ backgroundColor: props.color }}
              />
            )}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}


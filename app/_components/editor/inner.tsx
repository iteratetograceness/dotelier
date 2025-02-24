'use client'

import { Pixel } from '@/app/db/supabase/types'
import { BaseWindow } from '../window/base'
import { Button } from '../button'
import NextImage from 'next/image'
import { getPublicPixelAsset } from '@/app/db/supabase/storage'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { removeBackground, saveImageToDb, vectorizeImage } from './actions'
import { getError } from '@/lib/error'
import { revalidatePath } from 'next/cache'

export function EditorStudioInner({
  icon,
}: {
  icon: Pick<
    Pixel,
    'id' | 'file_path' | 'prompt' | 'style' | 'privacy' | 'user_id'
  >
}) {
  const [currentImage, setCurrentImage] = useState(
    getPublicPixelAsset(icon.file_path)
  )
  const [isSvg, setIsSvg] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isRemovingBackground, startRemovingBackground] = useTransition()
  const [isSavingImage, startSavingImage] = useTransition()
  const [isVectorizingImage, startVectorizingImage] = useTransition()

  const handleRemoveBackground = useCallback(() => {
    startRemovingBackground(async () => {
      try {
        const result = await removeBackground(currentImage)
        if ('error' in result) {
          throw new Error(getError(result.error))
        }
        setCurrentImage(result.url)
        setIsSaved(false)
      } catch {
        toast.error('Failed to remove background. Please try again.')
      }
    })
  }, [currentImage])

  const handleSaveImage = useCallback(() => {
    startSavingImage(async () => {
      try {
        const result = await saveImageToDb({
          originalPath: icon.file_path,
          imageUrl: currentImage,
        })
        if ('error' in result) {
          throw new Error(getError(result.error))
        }
        toast.success('Image saved successfully.')
        revalidatePath(`/edit/${icon.id}`)
        setIsSaved(true)
      } catch {
        toast.error('Failed to save image. Please try again.')
      }
    })
  }, [currentImage, icon.file_path, icon.id])

  const handleVectorizeImage = useCallback(() => {
    startVectorizingImage(async () => {
      try {
        const result = await vectorizeImage(currentImage)
        if ('error' in result) {
          throw new Error(getError(result.error))
        }
        setCurrentImage(result.url)
        setIsSaved(false)
      } catch {
        toast.error('Failed to convert to SVG. Please try again.')
      }
    })
  }, [currentImage])

  useEffect(() => {
    async function checkImageType() {
      try {
        const response = await fetch(currentImage, { method: 'HEAD' })
        const contentType = response.headers.get('content-type')
        setIsSvg(contentType?.includes('svg') ?? false)
      } catch (error) {
        console.error('Failed to check image type:', error)
        setIsSvg(false)
      }
    }
    checkImageType()
  }, [currentImage])

  return (
    <div className='flex justify-center items-center w-full'>
      <BaseWindow title='Editor' id='editor-studio' className='m-10 w-fit'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='border-[2px] border-shadow border-r-highlight border-b-highlight aspect-square w-fit'>
            <NextImage
              src={currentImage}
              alt={icon.prompt}
              width={250}
              height={250}
              className='object-contain'
              quality={100}
              unoptimized
              priority
            />
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col gap-1 pb-4'>
              <p className='text-sm'>Details</p>
              <p className='text-sm bg-foreground text-background w-fit px-1'>
                File Type: {isSvg ? 'SVG' : 'PNG'}
              </p>
            </div>
            <Button
              className='w-full sm:min-w-[202px] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none'
              disabled={isRemovingBackground || isSvg}
              onClick={handleRemoveBackground}
            >
              {isRemovingBackground ? 'Removing...' : 'Remove Background'}
            </Button>
            {/* <Button className='w-full'>Crop</Button> */}
            <Button
              className='w-full sm:min-w-[202px] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none'
              disabled={isVectorizingImage || isSvg}
              onClick={handleVectorizeImage}
            >
              {isVectorizingImage ? 'Converting...' : 'Convert to SVG'}
            </Button>
            {/* <Button>
              {icon.privacy === 'public' ? 'Make Private' : 'Make Public'}
            </Button> */}
            <Button
              className='w-full sm:min-w-[202px] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none'
              disabled={isSavingImage || isSaved}
              onClick={handleSaveImage}
            >
              {isSavingImage ? 'Saving...' : 'Save'}
            </Button>
            <p className='text-sm text-accent w-fit px-1'>
              {isSaved ? null : 'You have unsaved changes'}
            </p>
          </div>
        </div>
      </BaseWindow>
    </div>
  )
}

'use client'

import { removeBackground } from '@imgly/background-removal'
import { Pixel } from '@/app/db/supabase/types'
import { BaseWindow } from '../window/base'
import { Button } from '../button'
import Image from 'next/image'
import { getPublicPixelAsset } from '@/app/db/supabase/storage'
import { useState } from 'react'

export function EditorStudioInner({ icon }: { icon: Pixel }) {
  const [currentImage, setCurrentImage] = useState(
    getPublicPixelAsset(icon.file_path)
  )

  const handleRemoveBackground = async () => {
    const image = await fetch(currentImage)
    const imageBlob = await image.blob()
    const imageArray = await imageBlob.arrayBuffer()
    const imageUint8Array = new Uint8Array(imageArray)
    const imageData = await removeBackground(imageUint8Array)
    console.log(imageData)
    const url = URL.createObjectURL(imageData)
    setCurrentImage(url)
  }

  return (
    <div className='flex justify-center items-center w-full'>
      <BaseWindow title='Editor' id='editor-studio' className='m-10 w-fit'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='border-[2px] border-shadow border-r-highlight border-b-highlight aspect-square w-fit'>
            <Image
              src={currentImage}
              alt={icon.prompt}
              width={250}
              height={250}
              className='object-contain'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Button className='w-full' onClick={handleRemoveBackground}>
              Remove Background
            </Button>
            <Button className='w-full'>Convert to SVG</Button>
            {/* <Button>
              {icon.privacy === 'public' ? 'Make Private' : 'Make Public'}
            </Button> */}
            <Button className='w-full'>Save</Button>
          </div>
        </div>
      </BaseWindow>
    </div>
  )
}

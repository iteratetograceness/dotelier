'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { BaseWindow } from '../components/window/base'
import { Button } from '../components/button'

interface FormState {
  styleId?: string
  error?: string
}

async function createStyle(previousState: FormState, formData: FormData) {
  try {
    const response = await fetch('/api/style', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Failed to create style. Check logs.' }
    }

    return { styleId: data.styleId }
  } catch (error) {
    console.error('Error creating style: ', error)
    return { error: 'Failed to create style. Check logs.' }
  }
}

export default function CreateStyleForm() {
  const [state, dispatch, isPending] = useActionState<FormState, FormData>(
    createStyle,
    {
      styleId: undefined,
      error: undefined,
    }
  )

  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      )
      setSelectedImages(imageUrls)
    }
  }

  return (
    <BaseWindow
      className='flex flex-col items-center justify-center '
      title='create style form'
    >
      <form className='flex flex-col items-center gap-2 min-h-60 w-96 justify-between'>
        <input
          type='file'
          className='border border-highlight p-2 w-full'
          name='files'
          accept='.png'
          multiple
          onChange={handleImageChange}
          required
        />

        {/* Image previews */}
        <div className='flex flex-wrap gap-2'>
          {selectedImages.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`Preview ${index + 1}`}
              className='object-cover'
              width={50}
              height={50}
            />
          ))}
        </div>

        {state.styleId && (
          <div className='mt-2 text-sm text-green-600'>
            Style created and added to Edge Config: {state.styleId}
          </div>
        )}

        {state.error && (
          <div className='mt-2 text-sm text-red-600'>{state.error}</div>
        )}

        <Button
          className='w-full'
          type='submit'
          disabled={isPending}
          formAction={dispatch}
        >
          {isPending ? 'Creating Style' : 'Create Style'}
        </Button>
      </form>
    </BaseWindow>
  )
}

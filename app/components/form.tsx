'use client'

import { useState, useTransition } from 'react'
import { WindowCard } from './window'

export function PixelGenerator() {
  const [isPending, startTransition] = useTransition()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    startTransition(async () => {
      const formData = new FormData(e.currentTarget)
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
    <div className='flex gap-8 items-start'>
      <WindowCard className='flex-1' title='INPUT'>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <textarea
            className='bg-background '
            id='prompt'
            name='prompt'
            placeholder='A cockapoo and bichpoo leaning against each other'
          />
          <button disabled={isPending} type='submit'>
            {isPending ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </WindowCard>

      <WindowCard className='flex-1' title='OUTPUT'>
        {/* empty state */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt='pixelated icon' /> : <div>No icon yet</div>}
        {/* Link to download */}
        {/* Save to file */}
        {error && <div className='text-red-500'>{error}</div>}
      </WindowCard>
    </div>
  )
}

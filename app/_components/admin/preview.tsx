'use client'

import { generatePixelIcon } from '@/app/pixel-api/generate'
import { PixelApiResponse } from '@/app/pixel-api/types'
import { usePostProcessingStatus } from '@/app/utils/use-post-processing-status'
import { PostProcessingStatus } from '@/lib/constants'
import { getError } from '@/lib/error'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function Preview() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(0)
  const [pixelId, setPixelId] = useState<string>()
  const [images, setImages] = useState<PixelApiResponse['images']>()
  const [status, setStatus] = useState<PostProcessingStatus>()
  const [error, setError] = useState<string>()
  const [isGenerating, startGenerating] = useTransition()
  const {
    updates,
    latestUpdate,
    error: postProcessingError,
    connected,
  } = usePostProcessingStatus(pixelId)

  const testInference = async () => {
    if (duration > 0) setDuration(0)
    setError(undefined)
    setImages(undefined)
    setStatus(undefined)

    const id = uuidv4()
    setPixelId(id)

    startGenerating(async () => {
      const output = await generatePixelIcon({
        prompt,
        id,
      })

      if (!output.success) {
        setError(getError(output.error))
        return
      }

      setImages(output.result.images)
      setDuration(output.result.inference_time)
      setStatus(PostProcessingStatus.INITIATED)
    })
  }

  // Realtime updates to post_processing table:

  return (
    <div className='flex flex-col gap-4'>
      <input type='text' onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={testInference} disabled={isGenerating}>
        {isGenerating ? 'Running' : 'Run'}
      </button>
      {status && renderPostProcessingStatus(status)}
      {error && <p>Error: {error}</p>}
      {duration > 0 && <p>Inference Duration: {duration}s</p>}
      {pixelId && <p>Pixel ID: {pixelId}</p>}
      {images && (
        <Image
          src={images[0].url}
          alt='preview'
          width={200}
          height={200}
          className='rounded-md'
        />
      )}
    </div>
  )
}

function renderPostProcessingStatus(status: PostProcessingStatus) {
  switch (status) {
    case PostProcessingStatus.COMPLETED:
      return <p>Post Processing Completed</p>
    case PostProcessingStatus.BACKGROUND_REMOVAL:
      return <p>Background Removal</p>
    case PostProcessingStatus.BACKGROUND_REMOVAL_FAILED:
      return <p>Background Removal Failed</p>
    case PostProcessingStatus.CONVERT_TO_SVG:
      return <p>Converting to SVG</p>
    case PostProcessingStatus.CONVERT_TO_SVG_FAILED:
      return <p>SVG Conversion Failed</p>
    case PostProcessingStatus.INITIATED:
      return <p>Post Processing Initiated</p>
  }
}

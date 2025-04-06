'use client'

import { generatePixelIcon } from '@/app/pixel-api/generate'
import { PixelApiResponse } from '@/app/pixel-api/types'
import { usePostProcessingStatus } from '@/app/utils/use-post-processing-status'
import { PostProcessingStatus } from '@/lib/constants'
import { getError } from '@/lib/error'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../button'

export function Preview() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(0)
  const [pixelId, setPixelId] = useState<string>()
  const [images, setImages] = useState<PixelApiResponse['images']>()
  const [error, setError] = useState<string>()
  const [isGenerating, startGenerating] = useTransition()
  const { latestUpdate, error: postProcessingError } = usePostProcessingStatus({
    id: pixelId,
  })

  const testInference = async () => {
    if (duration > 0) setDuration(0)
    setError(undefined)
    setImages(undefined)

    const id = uuidv4()
    setPixelId(id)

    startGenerating(async () => {
      const output = await generatePixelIcon({
        prompt,
      })

      if (!output.success) {
        setError(getError(output.error))
        return
      }

      setImages(output.result.images)
      setDuration(output.result.inference_time)
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <input type='text' onChange={(e) => setPrompt(e.target.value)} />
      <Button onClick={testInference} disabled={isGenerating}>
        {isGenerating ? 'Running' : 'Run'}
      </Button>

      {latestUpdate && (
        <p>
          Post-Processing: {renderPostProcessingStatus(latestUpdate.status)}
        </p>
      )}

      {(error || postProcessingError) && (
        <p>Error: {error || postProcessingError}</p>
      )}

      {duration > 0 && <p>Inference Duration: {duration}s</p>}

      {pixelId && <p>Pixel ID: {pixelId}</p>}

      {images && (
        <Image src={images[0].url} alt='preview' width={200} height={200} />
      )}
    </div>
  )
}

function renderPostProcessingStatus(status: PostProcessingStatus) {
  switch (status) {
    case PostProcessingStatus.COMPLETED:
      return 'Completed'
    case PostProcessingStatus.BACKGROUND_REMOVAL:
      return 'Background Removal'
    case PostProcessingStatus.BACKGROUND_REMOVAL_FAILED:
      return 'Background Removal Failed'
    case PostProcessingStatus.CONVERT_TO_SVG:
      return 'Converting to SVG'
    case PostProcessingStatus.CONVERT_TO_SVG_FAILED:
      return 'SVG Conversion Failed'
    case PostProcessingStatus.INITIATED:
      return 'Initiated'
  }
}

'use client'

import { useNewCanvas } from '@/app/_components/studio/use-new-canvas'
import { cn } from '@/app/utils/classnames'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { revalidatePixelVersion } from '../swr/use-pixel-version'
import RetroLoader from './loader'

/**
 * Global floating indicator shown when a generation is in progress (or just finished).
 * Mounted in the root layout so it persists across all page navigations.
 *
 * On the home page, NewCanvas already shows full status — this only renders on other pages.
 * On refresh, Zustand resets to idle so this naturally disappears.
 */
export function GenerationMonitor() {
  const { status, prompt, id, reset } = useNewCanvas()
  const router = useRouter()
  const pathname = usePathname()

  const handleEdit = useCallback(() => {
    void revalidatePixelVersion(id)
    router.push(`/p/${id}`)
    reset()
  }, [id, router, reset])

  // Don't show on the home page — NewCanvas already handles it there
  if (pathname === '/') return null
  // Only show when there's something to show
  if (status === 'idle') return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-2',
        'bg-accent text-white pixel-corners pixel-border-accent',
        'shadow-lg max-w-[90vw]'
      )}
    >
      {status === 'generating' && <GeneratingState prompt={prompt} />}
      {status === 'post-processing' && <PostProcessingState prompt={prompt} />}
      {status === 'completed' && (
        <CompletedState prompt={prompt} onEdit={handleEdit} onDismiss={reset} />
      )}
      {status === 'error' && <ErrorState onDismiss={reset} />}
    </div>
  )
}

function GeneratingState({ prompt }: { prompt: string }) {
  return (
    <>
      <RetroLoader
        totalSegments={6}
        segmentWidth={8}
        segmentGap={2}
        height={12}
        className='text-white shrink-0'
      />
      <span className='text-xs truncate max-w-[200px]'>
        creating &ldquo;{prompt}&rdquo;...
      </span>
    </>
  )
}

function PostProcessingState({ prompt }: { prompt: string }) {
  return (
    <>
      <RetroLoader
        totalSegments={6}
        segmentWidth={8}
        segmentGap={2}
        height={12}
        className='text-white shrink-0'
      />
      <span className='text-xs truncate max-w-[200px]'>
        polishing &ldquo;{prompt}&rdquo;...
      </span>
    </>
  )
}

function CompletedState({
  prompt,
  onEdit,
  onDismiss,
}: {
  prompt: string
  onEdit: () => void
  onDismiss: () => void
}) {
  return (
    <>
      <span className='text-xs truncate max-w-[200px]'>
        &ldquo;{prompt}&rdquo; is ready!
      </span>
      <button
        onClick={onEdit}
        className='text-xs bg-white text-accent px-2 py-0.5 pixel-corners hover:bg-hover hover:text-accent shrink-0'
      >
        edit
      </button>
      <button
        onClick={onDismiss}
        className='text-xs text-medium hover:text-white shrink-0'
      >
        dismiss
      </button>
    </>
  )
}

function ErrorState({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <span className='text-xs'>generation failed</span>
      <button
        onClick={onDismiss}
        className='text-xs text-medium hover:text-white shrink-0'
      >
        dismiss
      </button>
    </>
  )
}

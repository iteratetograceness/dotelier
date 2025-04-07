import { PostProcessingStatus } from '@/lib/constants'
import { track } from '@vercel/analytics/react'
import { useEffect, useMemo, useState } from 'react'
import { revalidatePixelVersion } from '../swr/use-pixel-version'

interface Payload {
  operation: 'INSERT' | 'UPDATE'
  id: string
  pixelId: string
  status: PostProcessingStatus
  timestamp: number
}
interface StatusUpdate {
  type: 'connected' | 'update' | 'error' | 'heartbeat'
  payload?: Payload
  message?: string
  error?: string
  timestamp?: number
}

export function usePostProcessingStatus({
  id,
  onChange,
}: {
  id?: string
  onChange?: (
    status: 'error' | 'completed' | 'idle' | 'generating' | 'post-processing'
  ) => void
}) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])
  const [latestUpdate, setLatestUpdate] = useState<Payload>()
  const [error, setError] = useState<string>()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!id) return

    setUpdates([])
    setLatestUpdate(undefined)
    setError(undefined)
    setConnected(false)

    const eventSource = new EventSource(`/api/post-processing/${id}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StatusUpdate
        setUpdates((prev) => [...prev, data])

        if (data.type === 'connected') {
          setConnected(true)
        } else if (data.type === 'update' && data.payload) {
          setLatestUpdate(data.payload)
          if (data.payload.status === 'completed') {
            onChange?.(data.payload.status)
            eventSource.close()
            void revalidatePixelVersion(id)
          }
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error')
        }
      } catch (error) {
        // Track but silently fail:
        track('post-processing-status-error', {
          error: JSON.stringify(error),
        })
      }
    }

    eventSource.onerror = () => {
      setConnected(false)
      setError('Connection to post-processing service lost')
      setTimeout(() => {
        eventSource.close()
      }, 3000)
    }

    return () => {
      setConnected(false)
      eventSource.close()
    }
  }, [id, onChange])

  const isCompleted = useMemo(() => {
    return updates.some(
      (update) =>
        update.payload?.status === 'completed' ||
        update.payload?.status === 'background_removal_failed' ||
        update.payload?.status === 'convert_to_svg_failed'
    )
  }, [updates])

  const isPending = useMemo(() => {
    return updates.some(
      (update) =>
        update.payload?.status === 'initiated' ||
        update.payload?.status === 'background_removal' ||
        update.payload?.status === 'convert_to_svg'
    )
  }, [updates])

  return {
    updates,
    latestUpdate,
    error,
    connected,
    isCompleted,
    isPending,
  }
}

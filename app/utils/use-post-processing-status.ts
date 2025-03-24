import { PostProcessingStatus } from 'kysely-codegen'
import { useEffect, useMemo, useState } from 'react'

interface Payload {
  operation: 'INSERT' | 'UPDATE'
  id: string
  pixel_id: string
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

export function usePostProcessingStatus(pixelId?: string) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])
  const [latestUpdate, setLatestUpdate] = useState<Payload>()
  const [error, setError] = useState<string>()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!pixelId) return

    const eventSource = new EventSource(`/api/post-processing/${pixelId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StatusUpdate
        setUpdates((prev) => [...prev, data])

        if (data.type === 'connected') {
          setConnected(true)
        } else if (data.type === 'update' && data.payload) {
          setLatestUpdate(data.payload)
        } else if (data.type === 'error') {
          setError(data.message || 'Unknown error')
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
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
      eventSource.close()
    }
  }, [pixelId])

  useEffect(() => {
    const cleanUp = () => {
      setUpdates([])
      setLatestUpdate(undefined)
      setError(undefined)
      setConnected(false)
    }
    cleanUp()
    return cleanUp
  }, [pixelId])

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

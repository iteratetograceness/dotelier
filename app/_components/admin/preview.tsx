'use client'

import { supabase } from '@/app/db/supabase/client'
import { getPublicPixelAsset } from '@/app/db/supabase/storage'
import { JobStatus } from '@/lib/constants'
import { useEffect, useRef, useState, useTransition } from 'react'
import { startInference } from './action'

export function Preview() {
  const [prompt, setPrompt] = useState('')
  const [svg, setSvg] = useState<string>()
  const [duration, setDuration] = useState(0)
  const [jobId, setJobId] = useState<string>()
  const [jobStatus, setJobStatus] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const interval = useRef<NodeJS.Timeout>(null)

  const testInference = async () => {
    startTransition(async () => {
      if (duration > 0) setDuration(0)

      const startTime = Date.now()
      interval.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 100)

      try {
        const result = await startInference(prompt)
        if (result.error) {
          throw new Error(result.error)
        }

        if (result.jobId) {
          setJobId(result.jobId)
          setJobStatus('queued')
        }
      } catch (error) {
        clearInterval(interval.current)
        console.error('Error:', error)
      }
    })
  }

  useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!jobId) return

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const status = payload.new.status

          if (status === JobStatus.COMPLETED && payload.new.result_url) {
            if (interval.current) clearInterval(interval.current)
            setJobStatus(status)
            const path = payload.new.result_url
            const url = getPublicPixelAsset(path)
            setSvg(url)
          } else if (status === JobStatus.FAILED) {
            setJobStatus(status)
            if (interval.current) clearInterval(interval.current)
          } else {
            setJobStatus(status)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      if (interval.current) clearInterval(interval.current)
    }
  }, [jobId])

  return (
    <div className='flex flex-col gap-4'>
      <input type='text' onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={testInference} disabled={isPending}>
        {isPending ? 'Running' : 'Run'}
      </button>
      {duration > 0 && <p>Duration: {duration}s</p>}
      {jobId && <pre>Job ID: {jobId}</pre>}
      {jobStatus && <pre>Job Status: {renderJobStatus(jobStatus)}</pre>}
      {svg && <img src={svg} alt='preview' />}
    </div>
  )
}

function renderJobStatus(status: string) {
  switch (status) {
    case JobStatus.COMPLETED:
      return <p>Completed</p>
    case JobStatus.FAILED:
      return <p>Failed</p>
    case JobStatus.INFERENCE:
      return <p>Running Inference</p>
    case JobStatus.INITIATED:
      return <p>Initiated</p>
    case JobStatus.POST_PROCESSING:
      return <p>Post Processing</p>
    case JobStatus.QUEUED:
      return <p>Queued</p>
  }
}

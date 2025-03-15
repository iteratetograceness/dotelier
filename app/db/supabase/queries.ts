'server-only'

import { cache } from 'react'
import { JOBS_PAGE_SIZE, PAGE_SIZE } from './constants'
import { createClient } from './server'
import { Job, Pixel } from './types'

async function _getAllPixels({
  page = 1,
  ownerId,
}: {
  page?: number
  ownerId?: string
}): Promise<Pick<Pixel, 'id' | 'file_path' | 'prompt'>[]> {
  const supabase = await createClient()
  const query = supabase
    .from('pixel')
    .select('id, file_path, prompt')
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (ownerId) {
    query.eq('user_id', ownerId)
  } else {
    query.eq('privacy', 'public')
  }

  const { data, error } = await query

  if (error) {
    console.error('[getAllPixels]: ', error)
    return []
  }

  return data
}

async function _getPixelById(
  id: number
): Promise<Pick<
  Pixel,
  'id' | 'file_path' | 'prompt' | 'style' | 'privacy' | 'user_id'
> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pixel')
    .select(
      `id,
      file_path, 
      prompt, 
      style, 
      privacy,
      user_id`
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getPixelById]: ', error)
    return null
  }
  return data
}

async function _getTotalIconCount(filterByOwnerId?: string): Promise<number> {
  const supabase = await createClient()
  const query = supabase.from('pixel').select('id', { count: 'exact' })

  if (filterByOwnerId) {
    query.eq('user_id', filterByOwnerId)
  } else {
    query.eq('privacy', 'public')
  }

  const { data, error } = await query
  if (error) {
    console.error('[getTotalIconCount]: ', error)
    return 0
  }

  return data.length
}

function calculateTotalPages(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
}

async function _getPageCount(ownerId?: string): Promise<number> {
  const totalCount = await _getTotalIconCount(ownerId)
  return calculateTotalPages(totalCount)
}

async function _getJobs({
  limit = JOBS_PAGE_SIZE,
  page = 0,
}: {
  limit?: number
  page?: number
} = {}): Promise<Pick<Job, 'id' | 'prompt' | 'status' | 'updated_at'>[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('id, prompt, status, updated_at, created_at')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  const cleanUpData = data?.map((job) => ({
    id: job.id,
    prompt: cleanUpPrompt(job.prompt),
    status: job.status,
    updated_at: job.updated_at ?? job.created_at,
  }))

  if (error) {
    console.error('[getJobs]: ', error)
  }

  return cleanUpData ?? []
}

function cleanUpPrompt(prompt: string): string {
  const split = prompt.split('of:')[1]
  return split
    ? split.replace(
        ', 16-bit, on white background, only use up to 7 colors inclusive of #fff and #000, only use #fff for the background and #000 for black outline',
        ''
      )
    : prompt
}
export const getAllPixels = cache(_getAllPixels)
export const getPixelById = cache(_getPixelById)
export const getTotalIconCount = cache(_getTotalIconCount)
export const getPageCount = cache(_getPageCount)
export const getJobs = cache(_getJobs)

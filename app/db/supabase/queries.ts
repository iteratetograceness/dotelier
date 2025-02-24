'server-only'

import { cache } from 'react'
import { createClient } from './server'
import { Pixel } from './types'
import { PAGE_SIZE } from './constants'

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

export const getAllPixels = cache(_getAllPixels)
export const getPixelById = cache(_getPixelById)
export const getTotalIconCount = cache(_getTotalIconCount)
export const getPageCount = cache(_getPageCount)

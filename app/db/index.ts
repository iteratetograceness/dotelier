'server-only'

import { cache } from 'react'
import e from '../../dbschema/edgeql-js'
import { Client } from 'edgedb'
import { PublicIcon } from '../components/explore/icon'

export const PAGE_SIZE = 24

async function _getUserName(client: Client) {
  const query = e.select(e.User, () => ({
    name: true,
  }))
  const user = await query.run(client)
  return user[0]?.name
}

async function _getUserId(client: Client) {
  const query = e.select(e.User, () => ({
    id: true,
  }))
  const user = await query.run(client)
  return user[0]?.id
}

async function _getTotalIconCount(client: Client, ownerId?: string) {
  const query = e.select(e.count(e.Pixel), () => ({
    filter: ownerId ? e.op(e.Pixel.owner.id, '=', ownerId) : undefined,
  }))
  const result = await query.run(client)
  return result
}

async function _getPixelatedIcons(
  client: Client,
  {
    userId,
    offset = 0,
    limit = PAGE_SIZE,
  }: {
    userId?: string
    offset?: number
    limit?: number
  } = {}
): Promise<Omit<PublicIcon, 'created_at' | 'category' | 'owner'>[]> {
  const query = e.select(e.Pixel, (pixel) => ({
    id: true,
    prompt: true,
    url: true,
    filter: userId ? e.op(pixel.owner.id, '=', userId) : undefined,
    order_by: {
      expression: pixel.created_at,
      direction: e.DESC,
    },
    limit: limit,
    offset: offset,
  }))

  const icons = await query.run(client)
  return icons
}

async function _getIconDetails(
  client: Client,
  id: string
): Promise<PublicIcon | null> {
  const query = e
    .select(e.Pixel, (pixel) => ({
      id: true,
      prompt: true,
      url: true,
      created_at: true,
      category: {
        slug: true,
      },
      owner: {
        name: true,
      },
      filter: e.op(pixel.id, '=', e.uuid(id)),
    }))
    .assert_single()
  const icon = await query.run(client)
  return icon
}

function calculateTotalPages(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
}

async function _getPageCount(
  client: Client,
  ownerId?: string
): Promise<number> {
  const totalCount = await _getTotalIconCount(client, ownerId)
  return calculateTotalPages(totalCount)
}

export const getUserName = cache(_getUserName)
export const getUserId = cache(_getUserId)
export const getPageCount = cache(_getPageCount)
export const getPixelatedIcons = cache(_getPixelatedIcons)
export const getIconDetails = cache(_getIconDetails)

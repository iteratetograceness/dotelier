import e from '../../dbschema/edgeql-js'
import { Client } from 'edgedb'

export const PAGE_SIZE = 50

export async function getUserName(client: Client) {
  const query = e.select(e.User, () => ({
    name: true,
  }))
  const user = await query.run(client)
  return user[0]?.name
}

export async function getUserId(client: Client) {
  const query = e.select(e.User, () => ({
    id: true,
  }))
  const user = await query.run(client)
  return user[0]?.id
}

export async function getTotalIconCount(
  client: Client,
  { userId }: { userId?: string } = {}
) {
  const query = e.select(e.Pixel, (pixel) => ({
    filter: userId ? e.op(pixel.owner.id, '=', userId) : undefined,
    count: true,
  }))
  const result = await query.run(client)
  return result
}

export async function getPixelatedIcons(
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
) {
  const query = e.select(e.Pixel, (pixel) => ({
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

export function calculateTotalPages(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
}

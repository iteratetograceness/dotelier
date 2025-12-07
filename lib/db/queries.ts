'server-only'

import { LatestPixelVersion } from '@/app/swr/use-pixel-version'
import { SelectExpression } from 'kysely'
import { DB, PostProcessingStatus } from 'kysely-codegen'
import { cacheTag } from 'next/cache'
import { cache } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { db } from './pg'

const PAGE_SIZE = 10

const _createPixel = async ({
  userId,
  prompt,
  pixelId,
}: {
  userId: string
  prompt: string
  pixelId?: string
}) => {
  const result = await db
    .insertInto('pixel')
    .values({
      userId,
      prompt,
      id: pixelId ?? uuidv4(),
    })
    .returning('id')
    .executeTakeFirst()

  return result?.id
}

const _deletePixel = async (pixelId: string) => {
  const result = await db
    .deleteFrom('pixel')
    .where('id', '=', pixelId)
    .returning('id')
    .executeTakeFirst()

  return result?.id
}
const _startPostProcessing = async ({
  pixelId,
  fileKey,
}: {
  pixelId: string
  fileKey: string
}) => {
  const result = await db
    .insertInto('postProcessing')
    .values({ id: uuidv4(), pixelId, pngOriginalFileKey: fileKey })
    .returning('id')
    .executeTakeFirst()

  return result?.id
}
const _updatePostProcessingStatus = async ({
  pixelId,
  status,
  pngNobgFileKey,
  errorMessage,
  completedAt,
}: {
  pixelId: string
  status?: PostProcessingStatus
  pngNobgFileKey?: string
  errorMessage?: string
  completedAt?: Date
}) => {
  const newData = {
    status,
    pngNobgFileKey,
    errorMessage,
    completedAt,
  }
  const result = await db
    .updateTable('postProcessing')
    .set(newData)
    .where('postProcessing.pixelId', '=', pixelId)
    .returning('id')
    .executeTakeFirst()
  return result?.id
}
async function _getExplorePagePixels(page = 1, limit = PAGE_SIZE) {
  'use cache'
  cacheTag('explore-pixels')
  const offset = (page - 1) * limit
  return db
    .selectFrom('pixel')
    .leftJoin('pixelVersion', (join) =>
      join
        .onRef('pixel.id', '=', 'pixelVersion.pixelId')
        .on('pixelVersion.isCurrent', '=', true)
    )
    .select([
      'pixel.id',
      'pixel.prompt',
      'pixelVersion.fileKey',
      'pixelVersion.version',
    ])
    .where('pixel.showExplore', '=', true)
    .orderBy('pixel.createdAt', 'desc')
    .limit(limit)
    .offset(offset)
    .execute()
}
async function _isExplorePagePixel(pixelId: string): Promise<boolean> {
  'use cache'
  cacheTag(`isExplorePagePixel:${pixelId}`)
  const pixel = await db
    .selectFrom('pixel')
    .select(['pixel.showExplore'])
    .where('pixel.id', '=', pixelId)
    .executeTakeFirst()
  return pixel?.showExplore ?? false
}
async function _isPixelOwner(
  pixelId: string,
  userId: string
): Promise<boolean> {
  'use cache'
  cacheTag(`isPixelOwner:${pixelId}:${userId}`)
  const pixel = await db
    .selectFrom('pixel')
    .select(['pixel.userId'])
    .where('pixel.id', '=', pixelId)
    .where('pixel.userId', '=', userId)
    .executeTakeFirst()
  return pixel?.userId === userId
}
async function _getLatestPixelVersion(
  pixelId: string
): Promise<LatestPixelVersion | undefined> {
  'use cache'
  cacheTag(`pixel:${pixelId}`)
  const result = await db
    .selectFrom('pixelVersion')
    .select([
      'pixelVersion.id',
      'pixelVersion.fileKey',
      'pixelVersion.version',
      'pixelVersion.gridSize',
    ])
    .where('pixelVersion.pixelId', '=', pixelId)
    .where('pixelVersion.isCurrent', '=', true)
    .executeTakeFirst()

  if (!result) return undefined

  return {
    ...result,
    gridSize: result.gridSize ?? 32, // Default to 32 for backwards compatibility
  }
}
async function _getPixelsMetadataByOwner({
  page = 1,
  ownerId,
  limit = PAGE_SIZE,
  withPrompt = false,
}: {
  page?: number
  ownerId: string
  limit?: number
  withPrompt?: boolean
}) {
  const offset = (page - 1) * limit
  const select: SelectExpression<DB, 'pixel'>[] = ['pixel.id']
  if (withPrompt) select.push('pixel.prompt')

  const [pixels, totalCountResult] = await Promise.all([
    db
      .selectFrom('pixel')
      .select(select)
      .where('pixel.userId', '=', ownerId)
      .orderBy('pixel.createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute(),
    db
      .selectFrom('pixel')
      .select(db.fn.count('pixel.id').as('count'))
      .where('pixel.userId', '=', ownerId)
      .executeTakeFirst(),
  ])

  const totalCount = Number(totalCountResult?.count ?? 0)
  const totalPages = Math.ceil(totalCount / limit)

  return {
    pixels,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

async function _getPixelsWithVersionsByOwner({
  page = 1,
  ownerId,
  limit = PAGE_SIZE,
}: {
  page?: number
  ownerId: string
  limit?: number
}) {
  const offset = (page - 1) * limit

  const [pixels, totalCountResult] = await Promise.all([
    db
      .selectFrom('pixel')
      .leftJoin('pixelVersion', (join) =>
        join
          .onRef('pixel.id', '=', 'pixelVersion.pixelId')
          .on('pixelVersion.isCurrent', '=', true)
      )
      .select([
        'pixel.id',
        'pixel.prompt',
        'pixelVersion.fileKey',
        'pixelVersion.version',
        'pixelVersion.id as versionId',
      ])
      .where('pixel.userId', '=', ownerId)
      .orderBy('pixel.createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute(),
    db
      .selectFrom('pixel')
      .select(db.fn.count('pixel.id').as('count'))
      .where('pixel.userId', '=', ownerId)
      .executeTakeFirst(),
  ])

  const totalCount = Number(totalCountResult?.count ?? 0)
  const totalPages = Math.ceil(totalCount / limit)

  return {
    pixels,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}
async function _getLatestPixelIds(ownerId: string) {
  'use cache'
  cacheTag(`getLatestPixelIds:${ownerId}`)
  return _getPixelsMetadataByOwner({ ownerId, limit: 3 })
}
async function _getPixelById(pixelId: string) {
  'use cache'
  cacheTag(`pixel:${pixelId}`)
  return db
    .selectFrom('pixel')
    .select([
      'pixel.id',
      'pixel.prompt',
      'pixel.createdAt',
      'pixel.updatedAt',
      'pixel.showExplore',
      'pixel.userId',
    ])
    .where('pixel.id', '=', pixelId)
    .executeTakeFirst()
}

async function _insertPixelVersion({
  pixelId,
  fileKey,
  version = 0,
  gridSize = 32,
}: {
  pixelId: string
  fileKey: string
  version?: number
  gridSize?: number
}) {
  return db.transaction().execute(async (tx) => {
    const prevProw = version
      ? await tx
          .updateTable('pixelVersion')
          .set({ isCurrent: false })
          .where('pixelVersion.pixelId', '=', pixelId)
          .returning('id')
          .executeTakeFirstOrThrow()
      : undefined

    const newRow = await tx
      .insertInto('pixelVersion')
      .values({ id: uuidv4(), pixelId, fileKey, isCurrent: true, version, gridSize })
      .returning('id')
      .executeTakeFirstOrThrow()

    const updateRow = await tx
      .updateTable('pixel')
      .set({
        updatedAt: new Date(),
      })
      .where('pixel.id', '=', pixelId)
      .returning('id')
      .executeTakeFirstOrThrow()

    return {
      prevPixelVersion: prevProw?.id,
      pixelVersion: newRow?.id,
      updateRow: updateRow?.id,
    }
  })
}

// PIXELS
export const getExplorePagePixels = cache(_getExplorePagePixels)
export const isExplorePagePixel = cache(_isExplorePagePixel)
export const getLatestPixelVersion = cache(_getLatestPixelVersion)
export const getPixelsMetadataByOwner = cache(_getPixelsMetadataByOwner)
export const getPixelsWithVersionsByOwner = cache(_getPixelsWithVersionsByOwner)
export const getLatestPixelIds = cache(_getLatestPixelIds)
export const getPixelById = cache(_getPixelById)
export const isPixelOwner = cache(_isPixelOwner)
export const createPixel = _createPixel
export const deletePixel = _deletePixel
export const startPostProcessing = _startPostProcessing
export const updatePostProcessingStatus = _updatePostProcessingStatus

// VERSION
export const insertPixelVersion = _insertPixelVersion

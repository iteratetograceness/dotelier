'server-only'

import { PostProcessingStatus } from 'kysely-codegen'
import { cache } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { fastDb } from './pg'

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
  const result = await fastDb
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
const _startPostProcessing = async ({
  pixelId,
  fileKey,
}: {
  pixelId: string
  fileKey: string
}) => {
  const result = await fastDb
    .insertInto('postProcessing')
    .values({ pixelId, pngOriginalFileKey: fileKey })
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
  const result = await fastDb
    .updateTable('postProcessing')
    .set(newData)
    .where('postProcessing.pixelId', '=', pixelId)
    .returning('id')
    .executeTakeFirst()
  return result?.id
}
async function _getExplorePagePixels(page = 1) {
  const offset = (page - 1) * PAGE_SIZE
  return fastDb
    .selectFrom('pixel')
    .select(['pixel.id', 'pixel.prompt'])
    .where('pixel.showExplore', '=', true)
    .orderBy('pixel.createdAt', 'desc')
    .limit(PAGE_SIZE)
    .offset(offset)
    .execute()
}
async function _getLatestPixelVersion(pixelId: string) {
  return fastDb
    .selectFrom('pixelVersion')
    .select(['pixelVersion.id', 'pixelVersion.fileKey'])
    .where('pixelVersion.pixelId', '=', pixelId)
    .where('pixelVersion.isCurrent', '=', true)
    .executeTakeFirst()
}
async function _getPixelsByOwner({
  page = 1,
  ownerId,
}: {
  page?: number
  ownerId: string
}) {
  const offset = (page - 1) * PAGE_SIZE

  return fastDb
    .selectFrom('pixel')
    .select([
      'pixel.id',
      'pixel.prompt',
      'pixel.createdAt',
      'pixel.updatedAt',
      'pixel.showExplore',
    ])
    .where('pixel.userId', '=', ownerId)
    .orderBy('pixel.createdAt', 'desc')
    .limit(PAGE_SIZE)
    .offset(offset)
    .execute()
}
async function _getPixelById(pixelId: string) {
  return fastDb
    .selectFrom('pixel')
    .select([
      'pixel.id',
      'pixel.prompt',
      'pixel.createdAt',
      'pixel.updatedAt',
      'pixel.showExplore',
    ])
    .where('pixel.id', '=', pixelId)
    .executeTakeFirst()
}

async function _insertPixelVersion({
  pixelId,
  fileKey,
}: {
  pixelId: string
  fileKey: string
}) {
  const result = await fastDb
    .insertInto('pixelVersion')
    .values({ pixelId, fileKey, isCurrent: true })
    .returning('id')
    .executeTakeFirst()
  return result?.id
}

// PIXELS
export const getExplorePagePixels = cache(_getExplorePagePixels)
export const getLatestPixelVersion = cache(_getLatestPixelVersion)
export const getPixelsByOwner = cache(_getPixelsByOwner)
export const getPixelById = cache(_getPixelById)
export const createPixel = _createPixel
export const startPostProcessing = _startPostProcessing
export const updatePostProcessingStatus = _updatePostProcessingStatus

// VERSION
export const insertPixelVersion = _insertPixelVersion

'use server'

import { db } from '@/app/db/client'
import { getPixelatedIcons, PAGE_SIZE } from '@/app/db'
import { cache } from 'react'

async function _getIconsByPage(page: number) {
  return getPixelatedIcons(db, { offset: (page - 1) * PAGE_SIZE })
}

export const getIconsByPage = cache(_getIconsByPage)

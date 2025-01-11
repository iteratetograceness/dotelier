import { getPixelatedIcons } from '@/app/db'
import { db } from '@/app/db/client'
import { IconGridClient } from './client'

export async function IconGrid() {
  const icons = await getPixelatedIcons(db)
  return <IconGridClient icons={icons} />
}

import { IconGridClient } from './client'
import { getAllPixels } from '@/app/db/supabase/queries'

export async function IconGrid({
  searchParams,
  userId,
}: {
  searchParams: Promise<{ p: string | null }>
  userId?: string
}) {
  const { p } = await searchParams
  const data = await getAllPixels({
    page: parseInt(p || '1'),
    ownerId: userId,
  })
  return <IconGridClient icons={data} />
}

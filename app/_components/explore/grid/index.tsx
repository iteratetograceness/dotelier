import { getExplorePagePixels } from '@/lib/db/queries'
import { IconGridClient } from './client'

export async function IconGrid({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  const { p } = await searchParams
  const data = await getExplorePagePixels(parseInt(p || '1'))
  return <IconGridClient icons={data} />
}

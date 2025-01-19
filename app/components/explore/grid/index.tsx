import { IconGridClient } from './client'
import { getIconsByPage } from '../taskbar/actions'

export async function IconGrid({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  const { p } = await searchParams
  const page = p ? parseInt(p) : 1
  const icons = await getIconsByPage(page)
  return <IconGridClient icons={icons} />
}

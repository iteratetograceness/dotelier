import { getSession } from '@/lib/auth/session'
import { getPixelsByOwner } from '@/lib/db/queries'
import { Studio } from '.'

export async function StudioServer({ className }: { className?: string }) {
  const data = await getSession()

  const pixels = data?.user
    ? await getPixelsByOwner({
        ownerId: data.user.id,
        limit: 4,
      })
    : []

  return <Studio className={className} pixels={pixels} />
}

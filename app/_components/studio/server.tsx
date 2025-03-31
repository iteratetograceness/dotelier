import { auth } from '@/lib/auth'
import { getPixelsByOwner } from '@/lib/db/queries'
import { headers } from 'next/headers'
import { Studio } from '.'

export async function StudioServer({ className }: { className?: string }) {
  const data = await auth.api.getSession({
    headers: await headers(),
  })

  const pixels = data?.user
    ? await getPixelsByOwner({
        ownerId: data.user.id,
        limit: 4,
      })
    : []

  return <Studio className={className} pixels={pixels} />
}

import { authorizeRequest } from '@/lib/auth/request'
import { getPixelById } from '@/lib/db/queries'
import { notFound } from 'next/navigation'
import { MyPixelView } from './owner'
import { PublicPixelView } from './public'

export default async function PixelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, auth] = await Promise.all([params, authorizeRequest()])
  const pixel = await getPixelById(id)

  if (!pixel) notFound()

  const showOnExplore = pixel.showExplore
  const isOwner = auth.success && auth.user.id === pixel.userId

  if (!isOwner && !showOnExplore) notFound()

  if (isOwner) {
    return <MyPixelView pixel={pixel} />
  }

  if (!isOwner && showOnExplore) {
    return <PublicPixelView pixel={pixel} />
  }

  return notFound()
}

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getPixelById } from '@/app/db/supabase/queries'
import IconDetails from '@/app/explore/@modal/[id]/component'
import { ERROR_CODES } from '@/lib/error'

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>
}) {
  const { id } = await params
  const icon = await getPixelById(id)

  if (!icon) {
    redirect(`/atelier?e=${ERROR_CODES.ICON_NOT_FOUND}`)
  }

  return (
    <Suspense>
      <IconDetails icon={icon} />
    </Suspense>
  )
}

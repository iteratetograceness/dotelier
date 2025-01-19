import { Suspense } from 'react'
import IconDetails from './component'
import { getIconDetails } from '@/app/db'
import { db } from '@/app/db/client'
import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const icon = await getIconDetails(db, id)

  if (!icon) {
    redirect('/explore')
  }

  return (
    <Suspense>
      <IconDetails icon={icon} />
    </Suspense>
  )
}

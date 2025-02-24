import { Suspense } from 'react'
import IconDetails from './component'
import { redirect } from 'next/navigation'
import { getPixelById } from '@/app/db/supabase/queries'

export default async function Page({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params
  const icon = await getPixelById(id)

  if (!icon) {
    redirect('/explore')
  }

  return (
    <Suspense>
      <IconDetails icon={icon} />
    </Suspense>
  )
}

import { getPixelById } from '@/app/db/supabase/queries'
import { ERROR_CODES } from '@/lib/error'
import { redirect } from 'next/navigation'
import { EditorStudioInner } from './inner'

export async function EditorStudioOuter({ id }: { id: number }) {
  const icon = await getPixelById(id)

  if (!icon) {
    redirect(`/atelier?e=${ERROR_CODES.ICON_NOT_FOUND}`)
  }

  return <EditorStudioInner icon={icon} />
}

// TODO: Add skeleton
export function EditorStudioSkeleton() {
  return null
}

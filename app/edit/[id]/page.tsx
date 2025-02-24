import {
  EditorStudioOuter,
  EditorStudioSkeleton,
} from '@/app/_components/editor'
import { Suspense } from 'react'

export default async function Editor(props: { params: Promise<{ id: number }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<EditorStudioSkeleton />}>
      <EditorStudioOuter id={params.id} />
    </Suspense>
  )
}

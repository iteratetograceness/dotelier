import {
  EditorStudioOuter,
  EditorStudioSkeleton,
} from '@/app/_components/editor'
import { Suspense } from 'react'

export default function Editor({ params }: { params: { id: number } }) {
  return (
    <Suspense fallback={<EditorStudioSkeleton />}>
      <EditorStudioOuter id={params.id} />
    </Suspense>
  )
}

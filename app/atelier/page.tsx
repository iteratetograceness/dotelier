import {
  ExplorerWithUser,
  ExplorerWithUserSkeleton,
} from '@/app/_components/explore/with-user'
import { Suspense } from 'react'

export default function MyIcons({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  return (
    <Suspense fallback={<ExplorerWithUserSkeleton />}>
      <ExplorerWithUser searchParams={searchParams} />
    </Suspense>
  )
}

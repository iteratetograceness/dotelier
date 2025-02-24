import {
  ExplorerWithUser,
  ExplorerWithUserSkeleton,
} from '@/app/_components/explore/with-user'
import { Suspense } from 'react'

export default async function MyIcons(
  props: {
    searchParams: Promise<{ p: string | null }>
  }
) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<ExplorerWithUserSkeleton />}>
      <ExplorerWithUser searchParams={searchParams} />
    </Suspense>
  )
}

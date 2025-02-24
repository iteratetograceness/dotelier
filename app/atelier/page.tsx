import {
  ExplorerWithUser,
  ExplorerWithUserSkeleton,
} from '@/app/_components/explore/with-user'
import { Suspense } from 'react'

export default async function MyIcons(props: {
  searchParams: Promise<{ p: string | null }>
}) {
  return (
    <Suspense fallback={<ExplorerWithUserSkeleton />}>
      <ExplorerWithUser searchParams={props.searchParams} />
    </Suspense>
  )
}

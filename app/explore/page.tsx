import { Explorer } from '../_components/explore'

export default function Explore({
  searchParams,
}: {
  searchParams: Promise<{ p: string | null }>
}) {
  return <Explorer searchParams={searchParams} />
}

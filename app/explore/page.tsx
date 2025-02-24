import { Explorer } from '../_components/explore'

export default async function Explore(
  props: {
    searchParams: Promise<{ p: string | null }>
  }
) {
  const searchParams = await props.searchParams;
  return <Explorer searchParams={searchParams} />
}

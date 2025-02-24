import { Explorer } from '../_components/explore'

export default function Explore(props: { searchParams: Promise<{ p: string | null }> }) {
  return <Explorer searchParams={props.searchParams} />
}

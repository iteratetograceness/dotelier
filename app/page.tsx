import { Admin } from './_components/admin'
import { PixelGenerator } from './_components/form'
import { DraggableWindows } from './_components/window'

export default function Home() {
  return (
    <>
      <Admin />
      <DraggableWindows />
      <PixelGenerator />
    </>
  )
}

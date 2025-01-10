import { Admin } from './components/admin'
import { PixelGenerator } from './components/form'
import { DraggableWindows } from './components/window'

export default function Home() {
  return (
    <>
      <Admin />
      <DraggableWindows />
      <PixelGenerator />
    </>
  )
}

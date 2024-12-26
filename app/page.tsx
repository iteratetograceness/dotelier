import { Admin } from './components/admin'
import { PixelGenerator } from './components/form'
import { DragAndDrop } from './draggable'

export default function Home() {
  return (
    <>
      <Admin />
      <DragAndDrop />
      <PixelGenerator />
    </>
  )
}

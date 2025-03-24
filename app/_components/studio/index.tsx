import { Carousel } from '../carousel'
import { Canvas } from './canvas'
import { NewPixelInput } from './input'

/**
 * Need to do:
 *
 * - Fetch users' pixels to display in CANVAS
 * - In-canvas functionality
 * - Architecture for input -> new canvas
 */

export function Studio() {
  return (
    <main className='flex flex-col py-8'>
      <div className='flex'>
        <Carousel>
          <Canvas />
          <Canvas />
          <Canvas />
        </Carousel>
        <div id='new-canvas' className='snap-center'>
          <Canvas />
        </div>
      </div>
      <NewPixelInput />
    </main>
  )
}

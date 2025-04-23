import { Carousel } from '../_components/carousel'
import { PixelGroup } from '../_components/studio/pixels/group'

export default function StudioLayout({ canvas }: { canvas: React.ReactNode }) {
  return (
    <div className='py-7 md:my-auto'>
      <Carousel>
        {canvas}
        <PixelGroup />
      </Carousel>
    </div>
  )
}

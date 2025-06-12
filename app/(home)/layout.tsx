import Link from 'next/link'
import { Carousel } from '../_components/carousel'
import { PixelGroup } from '../_components/studio/pixels/group'
import { ViewAll } from '../_components/studio/pixels/view-all'

export default function StudioLayout({ canvas }: { canvas: React.ReactNode }) {
  return (
    <div className='py-7 md:my-auto'>
      <Carousel>
        {canvas}
        <PixelGroup />
        <ViewAll />
      </Carousel>
      <div className='text-center text-sm fixed bottom-0 bg-foreground text-white w-screen py-3 px-4'>
        <p>
          ✨ Note: Subtle imperfections are expected when mapping your icon to
          the grid-based editor! View or download the original{' '}
          <Link className='underline' href='studio'>
            in your Studio
          </Link>{' '}
          ✨
        </p>
      </div>
    </div>
  )
}

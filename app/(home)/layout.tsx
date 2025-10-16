import Link from 'next/link'
import { Suspense } from 'react'
import { Carousel } from '../_components/carousel'
import { PixelGroup } from '../_components/studio/pixels/group'

export default function StudioLayout({ canvas }: { canvas: React.ReactNode }) {
  return (
    <div className='py-7 md:my-auto'>
      <Carousel>
        {canvas}
        <Suspense>
          <PixelGroup />
        </Suspense>
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

import { Suspense } from 'react'

export default function PixelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className='flex-1 flex items-center justify-center'>
          Loading...
        </div>
      }
    >
      {children}
      <div className='text-center text-sm fixed bottom-0 bg-foreground text-white w-screen py-3 px-4'>
        <p>
          ✨ Note: Subtle imperfections are expected when mapping your icon to
          the grid-based editor! ✨
        </p>
      </div>
    </Suspense>
  )
}

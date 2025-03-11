import { Suspense } from 'react'
import { Admin } from './_components/admin'
// import { PixelGenerator } from './_components/form'
import { UserProfile } from './_components/user/profile'
// import { DraggableWindows } from './_components/window'

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
      {/* <DraggableWindows /> */}
      {/* <PixelGenerator /> */}
      <Suspense fallback={null}>
        <div className='fixed bottom-0 left-0'>
          <UserProfile />
        </div>
      </Suspense>
    </>
  )
}

import { Suspense } from 'react'
import { Admin } from './_components/admin'
import { PixelGenerator } from './_components/form'

export default function Home() {
  return (
    <>
      <PixelGenerator />
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    </>
  )
}

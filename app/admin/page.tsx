import { authorizeRequest } from '@/lib/auth/request'
import { notFound } from 'next/navigation'
import { HomeButton } from '../_components/admin/home-button'
import { Preview } from '../_components/admin/preview'
import { SVGDebugViewWrapper } from '../_components/studio/editor/debug'

export default async function AdminPage() {
  const auth = await authorizeRequest()

  if (!auth.success || auth.user.role !== 'admin') {
    notFound()
  }

  return (
    <main className='flex flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-2xl'>super secret admin page</h1>
      <HomeButton />
      <div className='flex flex-col gap-4'>
        <h2>playground</h2>
        <Preview />
      </div>
      <div className='flex flex-col gap-4'>
        <h2>debug</h2>
        <SVGDebugViewWrapper />
      </div>
    </main>
  )
}

import { HomeButton } from '../_components/admin/home-button'
import { Preview } from '../_components/admin/preview'

export default function AdminPage() {
  return (
    <main className='flex flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-2xl'>super secret admin page</h1>
      <HomeButton />
      <div className='flex flex-col gap-4'>
        <h2>Test Inference</h2>
        <Preview />
      </div>
    </main>
  )
}

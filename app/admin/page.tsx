import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Preview } from '../_components/admin/preview'
import { HomeButton } from './home-button'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token || !(await verifyToken(token))) {
    redirect('/')
  }

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

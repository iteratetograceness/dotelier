import { getSession } from '@/lib/auth/session'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { HomeButton } from '../_components/admin/home-button'

const Preview = dynamic(() =>
  import('../_components/admin/preview').then((mod) => mod.Preview)
)

export async function AdminPage() {
  const session = await getSession()

  if (session?.user.role !== 'admin') {
    return redirect('/')
  }

  return (
    <main className='flex flex-col items-center justify-center gap-4 p-4'>
      <h1 className='text-2xl'>super secret admin page</h1>
      <HomeButton />
      <div className='flex flex-col gap-4'>
        <h2>playground</h2>
        <Preview />
      </div>
    </main>
  )
}

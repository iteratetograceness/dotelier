import { getSession } from '@/lib/auth/session'
import { Tabs } from './_components/tabs'
import { UserProfile } from './_components/user/profile'

const tabs = [
  { href: '/', label: 'Studio', isActive: true },
  { href: '/explore', label: 'Explore' },
]

export async function Header() {
  const session = await getSession()

  return (
    <header className='flex flex-col items-center gap-6'>
      <div className='w-full bg-foreground h-16 flex items-center justify-between relative pr-3 pl-4'>
        <h1 className='text-background text-2xl'>dotelier studio</h1>
        <UserProfile />
      </div>
      <Tabs tabs={tabs} showSignOut={Boolean(session?.user)} />
    </header>
  )
}

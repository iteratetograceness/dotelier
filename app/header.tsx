import { Suspense } from 'react'
import { Tabs } from './_components/tabs'
import { UserProfile } from './_components/user/profile.server'

const tabs = [
  { href: '/', label: 'Home', isActive: true },
  { href: '/explore', label: 'Explore' },
  { href: '/collection', label: 'Collection' },
]

export function Header() {
  return (
    <header className='flex flex-col items-center gap-6'>
      <div className='w-full bg-foreground h-16 flex items-center justify-between relative pr-3 pl-4'>
        <h1 className='text-background text-2xl'>dotelier studio</h1>
        <Suspense>
          <UserProfile />
        </Suspense>
      </div>
      <Tabs tabs={tabs} />
    </header>
  )
}

import { NAV_LINKS } from '@/lib/constants'
import { Suspense } from 'react'
import { Tabs } from './_components/tabs'
import { UserProfile } from './_components/user/profile.server'

export function Header() {
  return (
    <header className='flex flex-col items-center'>
      <div className='w-full bg-foreground h-16 flex items-center justify-between relative pr-3 pl-4'>
        <h1 className='text-background text-2xl'>dotelier studio</h1>
        <div className='hidden md:block absolute -bottom-1 -left-4 -right-3 mx-auto w-full'>
          <Tabs tabs={NAV_LINKS} />
        </div>
        <Suspense>
          <UserProfile />
        </Suspense>
      </div>
      {/* <Tabs tabs={tabs} className='-mt-[42px] hidden sm:flex' /> */}
    </header>
  )
}

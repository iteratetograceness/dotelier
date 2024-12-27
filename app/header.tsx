import { SessionButton } from './components/session-button'
import { SelectionBox } from './components/selection-box'
import { BaseWindow } from './components/window/base'
import { Suspense } from 'react'
import { Button } from './components/button'
import { Welcome } from './components/welcome'
import Link from 'next/link'

export function Header() {
  return (
    <header className='flex flex-col items-center gap-8 p-8 pb-0 relative z-0'>
      <div className='pointer-events-none flex flex-col items-center gap-4 text-6xl'>
        <SelectionBox>DOTELIER</SelectionBox>
        <div className='sm:ml-72'>
          <SelectionBox>STUDIO</SelectionBox>
        </div>
      </div>
      <BaseWindow title='Main Menu' id='menu'>
        <div className='flex flex-col items-center w-fit gap-2'>
          <Suspense fallback={<p className='h-6' />}>
            <Welcome />
          </Suspense>
          <div className='flex gap-2'>
            <Link href='/'>
              <Button className='text-sm'>Home</Button>
            </Link>
            <Link href='/explore'>
              <Button className='text-sm'>Explore</Button>
            </Link>
            <Suspense fallback={<Button className='flex w-44 h-[34px]' />}>
              <SessionButton />
            </Suspense>
          </div>
        </div>
      </BaseWindow>
    </header>
  )
}

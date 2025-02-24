import Link from 'next/link'
import { SelectionBox } from './_components/selection-box'
import { BaseWindow } from './_components/window/base'
import { Button } from './_components/button'
import { LoginButton } from './_components/login/button'

// Signed in: show user details like credits left

export function Header() {
  return (
    <header className='flex flex-col items-center gap-8 p-8 pb-0 relative z-0'>
      <div className='pointer-events-none flex flex-col items-center gap-4 text-6xl'>
        <SelectionBox>DOTELIER</SelectionBox>
        <div className='sm:ml-72'>
          <SelectionBox>STUDIO</SelectionBox>
        </div>
      </div>
      <BaseWindow title='Main Menu' id='menu' className='w-full xs:w-fit'>
        <div className='flex flex-col items-center w-full gap-2'>
          <div className='flex flex-col xs:flex-row gap-2 w-full'>
            <Link href='/'>
              <Button className='text-sm w-full'>Home</Button>
            </Link>
            <Link href='/explore'>
              <Button className='text-sm w-full'>Explore</Button>
            </Link>
            <LoginButton />
          </div>
        </div>
      </BaseWindow>
    </header>
  )
}

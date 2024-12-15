import { SelectionBox } from './components/selection-box'
import { WindowCard } from './components/window'

export function Header() {
  return (
    <header className='flex flex-col items-center gap-4 p-8 relative text-6xl'>
      <div className='flex flex-col items-center gap-4'>
        <SelectionBox>DOTELIER</SelectionBox>
        <div className='sm:ml-72'>
          <SelectionBox>STUDIO</SelectionBox>
        </div>
      </div>
      <WindowCard className='w-fit' variant='secondary'>
        <h2 className='font-normal text-xl px-12'>A PIXEL ICON GENERATOR</h2>
      </WindowCard>
    </header>
  )
}

import { SelectionBox } from './components/selection-box'

export function Header() {
  return (
    <header className='pointer-events-none flex flex-col items-center gap-4 p-8 relative text-6xl z-0'>
      <div className='flex flex-col items-center gap-4'>
        <SelectionBox>DOTELIER</SelectionBox>
        <div className='sm:ml-72'>
          <SelectionBox>STUDIO</SelectionBox>
        </div>
      </div>
    </header>
  )
}

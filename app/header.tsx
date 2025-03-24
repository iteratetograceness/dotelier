import { Tabs } from './_components/tabs'

const tabs = [
  { href: '/', label: 'Studio', isActive: true },
  { href: '/explore', label: 'Explore' },
]

export function Header() {
  return (
    <header className='flex flex-col items-center z-0 sticky top-0 left-0 right-0'>
      <div className='w-full bg-foreground h-16 flex items-center justify-center'>
        <h1 className='text-white text-2xl'>dotelier studio</h1>
      </div>
      <Tabs className='pt-6' tabs={tabs} />
    </header>
  )
}

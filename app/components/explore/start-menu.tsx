export function StartMenu() {
  return (
    <div className='flex flex-col border border-foreground p-4 bg-background w-52'>
      <div className='h-8'>Welcome</div>
      <div className='flex'>
        <div className='w-1/2'>icons</div>
        <div className='w-1/2'>apps</div>
      </div>
      <div>Actions</div>
    </div>
  )
}

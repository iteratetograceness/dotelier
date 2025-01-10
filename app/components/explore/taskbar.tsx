import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Button } from '../button'

export default function Taskbar() {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState<string>('')

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes.toString().padStart(2, '0')
      setTime(`${formattedHours}:${formattedMinutes} ${ampm}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='h-10 border-t border-foreground flex items-center justify-between select-none'>
      <div className='flex'>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button isPressed={open} onClick={() => setOpen(!open)}>
              <span>Start</span>
            </Button>
          </Popover.Trigger>
          <Popover.Content side='top' align='start' className='w-auto p-0 mb-2'>
            Menu
            {/* <StartMenu /> */}
          </Popover.Content>
        </Popover.Root>
      </div>

      <div className='flex items-center gap-2 bg-gray-50 h-full px-2 border-l border-gray-200'>
        <div className='mx-1 h-6 flex'>
          <div className='w-[1px] h-full bg-gray-400'></div>
          <div className='w-[1px] h-full bg-white'></div>
        </div>
        <span className='text-sm font-medium text-gray-600 min-w-[80px] text-center'>
          {time}
        </span>
      </div>
    </div>
  )
}

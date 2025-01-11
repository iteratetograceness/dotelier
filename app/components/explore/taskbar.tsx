'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Button } from '../button'
import { StartMenu } from './start-menu'

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
    <div className='h-[50px] flex items-center justify-between select-none bg-hover border-t-[1px] border-hover relative'>
      <div className='absolute top-0 w-full h-[1px] bg-highlight' />
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            className='bg-hover mt-[6px] ml-[3px]'
            isPressed={open}
            onClick={() => setOpen(!open)}
          >
            <span>Start</span>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          side='top'
          align='start'
          className='w-auto'
          sideOffset={5}
        >
          <StartMenu />
        </Popover.Content>
      </Popover.Root>

      {/* Here we will render the pages as opened "programs" on the taskbar */}
      {/* Previous, disabled if current page is 1 */}
      {/* Current page N */}
      {/* Next, disabled if current page is the last page */}

      <div className='ml-auto flex items-center h-full'>
        <span className='text-sm min-w-[80px] text-center'>{time}</span>
      </div>
    </div>
  )
}

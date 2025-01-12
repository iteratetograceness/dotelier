'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { TaskbarButton } from './button'

export default function StartMenu() {
  const [isStartMenuOpen, setIsStartMenuOpen] = React.useState(false)

  return (
    <Popover.Root open={isStartMenuOpen} onOpenChange={setIsStartMenuOpen}>
      <Popover.Trigger asChild>
        <TaskbarButton
          className='w-fit !px-1.5 !pl-2'
          isPressed={isStartMenuOpen}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        >
          <span>Start</span>
        </TaskbarButton>
      </Popover.Trigger>
      <Popover.Content
        side='top'
        align='start'
        className='w-auto'
        sideOffset={5}
      >
        <Menu />
      </Popover.Content>
    </Popover.Root>
  )
}

/**
 * Need to add:
 * - Search bar
 * - My icons
 */
function Menu() {
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

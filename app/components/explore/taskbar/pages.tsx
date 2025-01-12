'use client'

import { useState } from 'react'
import { TaskbarButton } from './button'
import { ButtonProps } from '../../button'

export function Pages({ count }: { count: number }) {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className='flex items-center justify-between gap-1'>
      <Page
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </Page>
      {Array.from({ length: count }, (_, i) => i + 1).map((page) => (
        <Page
          key={page}
          onClick={() => setCurrentPage(page)}
          isPressed={currentPage === page}
        >
          Page {page}
        </Page>
      ))}
      <Page>Next</Page>
    </div>
  )
}

function Page({ children, ...props }: ButtonProps) {
  return (
    <TaskbarButton
      className={`!w-44 text-left !px-2 relative ${
        props.isPressed
          ? 'before:content-[""] before:absolute before:inset-0 before:bg-pattern before:opacity-15 before:z-1 before:m-0.5'
          : ''
      }`}
      {...props}
    >
      {children}
    </TaskbarButton>
  )
}

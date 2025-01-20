'use client'

import { TaskbarButton } from './button'
import { ButtonLinkProps } from '../../button'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/app/utils/classnames'

export function Pages({ count }: { count: number }) {
  const searchParams = useSearchParams()
  const currentPage = searchParams.get('p')

  const onFirstPage = currentPage === '1' || currentPage === null
  const onLastPage = currentPage === count.toString()
  const pageNum = currentPage ? parseInt(currentPage) : 1

  return (
    <div className='flex items-center justify-between gap-1'>
      <Page page={Math.max(1, pageNum - 1)} disabled={onFirstPage}>
        Back
      </Page>

      {Array.from({ length: count }, (_, i) => i + 1).map((page) => (
        <Page
          key={page}
          page={page}
          className='hidden sm:block'
          isPressed={page === (currentPage ? parseInt(currentPage) : 1)}
        >
          Page {page}
        </Page>
      ))}

      <Page page={Math.min(count, pageNum + 1)} disabled={onLastPage}>
        Next
      </Page>
    </div>
  )
}

function Page({
  children,
  page,
  ...props
}: Omit<ButtonLinkProps, 'href'> & { page: number }) {
  return (
    <TaskbarButton<true>
      {...props}
      href={`?p=${page}`}
      className={cn(
        'w-fit text-left !px-2 relative',
        props.isPressed
          ? 'before:content-[""] before:absolute before:inset-0 before:bg-pattern before:opacity-15 before:z-1 before:m-0.5'
          : '',
        props.className
      )}
    >
      {children}
    </TaskbarButton>
  )
}

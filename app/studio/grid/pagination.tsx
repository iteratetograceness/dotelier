'use client'

import { Button, ButtonLink } from '@/app/_components/button'
import { useSearchParams } from 'next/navigation'

type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PaginationProps = {
  pagination: PaginationMeta
}

export function Pagination({ pagination }: PaginationProps) {
  const searchParams = useSearchParams()

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  const getVisiblePages = () => {
    const { currentPage, totalPages } = pagination
    const maxVisible = 5
    const pages: number[] = []

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      const end = Math.min(totalPages, start + maxVisible - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  if (pagination.totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages()

  return (
    <div className='flex items-center justify-center gap-2 p-4'>
      {pagination.hasPreviousPage ? (
        <ButtonLink href={getPageUrl(pagination.currentPage - 1)}>
          Previous
        </ButtonLink>
      ) : (
        <Button disabled>Previous</Button>
      )}

      {visiblePages[0] > 1 && (
        <>
          <ButtonLink href={getPageUrl(1)}>1</ButtonLink>
          {visiblePages[0] > 2 && <span className='px-2'>...</span>}
        </>
      )}

      {visiblePages.map((page) =>
        page === pagination.currentPage ? (
          <Button key={page} variant='dark'>
            {page}
          </Button>
        ) : (
          <ButtonLink key={page} href={getPageUrl(page)}>
            {page}
          </ButtonLink>
        )
      )}

      {visiblePages[visiblePages.length - 1] < pagination.totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] <
            pagination.totalPages - 1 && <span className='px-2'>...</span>}
          <ButtonLink href={getPageUrl(pagination.totalPages)}>
            {pagination.totalPages}
          </ButtonLink>
        </>
      )}

      {pagination.hasNextPage ? (
        <ButtonLink href={getPageUrl(pagination.currentPage + 1)}>
          Next
        </ButtonLink>
      ) : (
        <Button disabled>Next</Button>
      )}
    </div>
  )
}

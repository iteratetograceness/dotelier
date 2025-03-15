'use client'

import { cn } from '@/app/utils/classnames'
import { JobStatus } from '@/lib/constants'
import { Fragment } from 'react'

interface JobExplorerProps {
  rows: Record<string, string>[]
  height?: number
  isLoading?: boolean
  isEmpty?: boolean
}

const COLUMNS = [
  {
    name: 'prompt',
    type: 'text',
  },
  {
    name: 'status',
    type: 'status',
  },
  {
    name: 'updated_at',
    type: 'date',
  },
]

const STATUS_COLORS = {
  [JobStatus.COMPLETED]: 'bg-green-900',
  [JobStatus.FAILED]: 'bg-red-900',
  [JobStatus.INFERENCE]: 'bg-teal-900',
  [JobStatus.INITIATED]: 'bg-blue-900',
  [JobStatus.POST_PROCESSING]: 'bg-indigo-900',
  [JobStatus.QUEUED]: 'bg-neutral-900',
}

export function JobExplorer({
  rows,
  height = 200,
  isLoading,
  isEmpty = false,
}: JobExplorerProps) {
  return (
    <div className='flex flex-col border-2 border-foreground'>
      {/* Column Headings */}
      <div className='flex-1 grid gap-0.5 grid-cols-[2fr_1fr_1fr]'>
        {COLUMNS.map((column) => (
          <div
            key={column.name}
            className='bg-foreground text-background w-full px-2 py-1 h-fit'
          >
            <p className='text-xs'>{column.name}</p>
          </div>
        ))}
      </div>
      {/* Rows */}
      <div
        className={cn(
          `overflow-y-auto max-h-[${height}px]`,
          'flex-1 grid gap-0.5 grid-cols-[2fr_1fr_1fr]'
        )}
        style={{
          maxHeight: `${height}px`,
        }}
      >
        {isLoading ? (
          <Skeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          rows.map((row, index) => (
            <Fragment key={row.id}>
              {COLUMNS.map((column) => {
                const isDate = column.type === 'date'
                const isStatus = column.type === 'status'

                return (
                  <p
                    className={cn(
                      'text-xs px-2 py-1 whitespace-nowrap overflow-x-auto scrollbar-none',
                      isStatus &&
                        `${
                          STATUS_COLORS[row[column.name] as JobStatus]
                        } text-background`
                    )}
                    key={`row-${index}-${column.name}`}
                  >
                    {isDate
                      ? new Date(row[column.name]).toLocaleString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                          year: '2-digit',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : row[column.name]}
                  </p>
                )
              })}
            </Fragment>
          ))
        )}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, index) => (
        <div
          key={index}
          className='px-2 py-1 animate-pulse bg-medium w-full h-6'
        />
      ))}
    </>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center h-32 col-span-3 bg-medium'>
      <p className='text-xs px-2 py-1 whitespace-nowrap overflow-x-auto scrollbar-none'>
        you haven't created any icons yet!
      </p>
    </div>
  )
}

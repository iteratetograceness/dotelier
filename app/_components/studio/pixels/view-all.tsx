'use client'
import { useSession } from '@/lib/auth/client'
import Image from 'next/image'
import Link from 'next/link'
import { Pill } from '../../pill'

export function ViewAll() {
  const { data: session } = useSession()
  if (!session) return null

  return (
    <div className='flex flex-col justify-center items-center size-full w-[calc(100vw-50px)] md:w-[500px] min-w-[250px] gap-4 bg-medium px-4 py-20 pixel-corners pixel-border-medium'>
      <Image
        src='/placeholder.svg'
        alt='View All'
        width={200}
        height={200}
        className='rounded-lg'
      />
      <Pill className='text-center'>
        To view all your icons,{' '}
        <Link className='underline' href='/studio' prefetch>
          visit your Studio
        </Link>
        .
      </Pill>
    </div>
  )
}

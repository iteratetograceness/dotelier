import { cn } from '@/app/utils/classnames'
import { getSession } from '@/lib/auth/session'
import Image from 'next/image'

/**
 * Need to do:
 *
 * - Avatar placeholder
 * - Settings link?
 */

export async function UserProfile({ className }: { className?: string }) {
  const session = await getSession()

  if (!session) return null

  const name =
    session.user.name.split(' ')[0] || session.user.email.split('@')[0]

  return (
    <div className={cn('flex gap-2 items-center', className)}>
      {/* Profile Image */}
      <div className='size-10 flex flex-col items-center justify-center pixel-corners pixel-border-background shrink-0'>
        {session.user.image ? (
          <Image
            src={session.user.image || ''}
            alt='user avatar'
            width={50}
            height={50}
          />
        ) : (
          <div className='bg-background size-full flex items-center justify-center'>
            <p className='text-3xl text-accent'>{name[0]}</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { credits } from '@/app/utils/credits'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Image from 'next/image'
import { SignInButton } from '../auth/sign-in-button'

/**
 * Need to do:
 *
 * - Avatar placeholder
 * - Settings link?
 */

export async function UserProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return (
      <div className='flex p-5 bg-foreground w-screen gap-4 justify-between'>
        <SignInButton />
      </div>
    )
  }

  const remainingCredits = await credits.get(session.user.id)
  const name =
    session.user.name.split(' ')[0] || session.user.email.split('@')[0]

  return (
    <div className='flex bg-foreground pixel-corners pixel-border-black w-full md:w-64 gap-2 p-2 m-4 items-end'>
      <div className='size-[60px] flex flex-col items-center justify-center pixel-corners pixel-border-background shrink-0'>
        <Image
          src={session.user.image || ''}
          className='bg-background'
          alt='user avatar'
          width={90}
          height={90}
        />
      </div>
      <div className='flex flex-col gap-1 text-background min-w-0 flex-1'>
        <p className='text-xl truncate overflow-hidden whitespace-nowrap leading-none text-ellipsis'>
          {name}
        </p>
        <p className='text-sm bg-background text-foreground px-1.5 py-0.5 w-fit leading-none pixel-corners'>
          {remainingCredits || 0} credit{remainingCredits === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Button } from './button'
import { auth } from '../db/client'
import Image from 'next/image'

export async function SessionButton() {
  const session = auth.getSession()

  if (session.authToken) {
    return (
      <Link className='flex' href={auth.getSignoutUrl()}>
        <Button className='text-sm w-44'>Sign out</Button>
      </Link>
    )
  }

  return (
    <Link className='flex' href={auth.getOAuthUrl('builtin::oauth_google')}>
      <Button className='text-sm w-44 flex items-center justify-center gap-1.5'>
        <Image
          src='/google-logo.svg'
          alt='Google logo'
          width={13}
          height={13}
        />
        Sign In
      </Button>
    </Link>
  )
}

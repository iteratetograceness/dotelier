import { Button } from './button'
import { auth } from '../db/client'
import Image from 'next/image'

export async function SessionButton() {
  const session = await auth.getSession()

  if (session.authToken) {
    return (
      <a className='flex' href={auth.getSignoutUrl()}>
        <Button className='text-sm w-full xs:w-fit'>Sign out</Button>
      </a>
    )
  }

  return (
    <a className='flex' href={auth.getOAuthUrl('builtin::oauth_google')}>
      <Button className='text-sm w-full xs:w-fit flex items-center justify-center gap-1.5'>
        <Image
          src='/google-logo.svg'
          alt='Google logo'
          width={13}
          height={13}
        />
        Sign In
      </Button>
    </a>
  )
}

import { SignInButton } from '../_components/auth/sign-in-button'

export function SignedOutState() {
  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <h3 className='text-lg font-bold'>Sign in to access your studio</h3>
      <SignInButton />
    </div>
  )
}

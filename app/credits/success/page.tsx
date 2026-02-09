import { credits } from '@/app/utils/credits'
import { Credits } from '@/app/_components/user/credits'
import { ButtonLink } from '@/app/_components/button'
import { getSession } from '@/lib/auth/session'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default function CreditsSuccess() {
  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl">Credits Added!</h1>
        <p className="text-sm text-shadow">
          Your credits have been added to your account.
        </p>
        <Suspense fallback={<CreditsSkeleton />}>
          <CurrentCredits />
        </Suspense>
      </div>
      <div className="flex gap-4">
        <ButtonLink href="/">Create</ButtonLink>
        <ButtonLink href="/studio">Studio</ButtonLink>
      </div>
    </div>
  )
}

function CreditsSkeleton() {
  return (
    <div className="flex gap-2 items-center bg-medium pixel-corners pixel-border-medium p-2 w-full">
      <Image src="/coin.svg" width={24} height={24} alt="Golden coin" />
      <div className="h-4 w-20 bg-light-shadow animate-pulse" />
    </div>
  )
}

async function CurrentCredits() {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  const currentCredits = await credits.get(session.user.id)

  return <Credits credits={currentCredits} />
}

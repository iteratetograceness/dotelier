import { credits } from '@/app/utils/credits'
import { Credits } from '@/app/_components/user/credits'
import { getSession } from '@/lib/auth/session'
import { CREDIT_PACKS } from '@/lib/constants'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { CreditPacks } from './packs.client'

export default function CreditsPage() {
  const env =
    process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
  const packs = CREDIT_PACKS.map((pack) => ({
    name: pack.name,
    credits: pack.credits,
    displayPrice: pack.displayPrice,
    productId: pack.productId[env],
    popular: 'popular' in pack ? pack.popular : false,
  }))

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4 w-full max-w-3xl mx-auto">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl">Get Credits</h1>
        <p className="text-sm text-shadow">
          Credits are used to generate pixel art icons.
        </p>
        <Suspense fallback={<CreditsSkeleton />}>
          <CurrentCredits />
        </Suspense>
      </div>
      <CreditPacks packs={packs} />
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

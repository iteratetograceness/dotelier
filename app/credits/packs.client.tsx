'use client'

import { checkout } from '@/lib/auth/client'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '../_components/button'

interface CreditPack {
  name: string
  credits: number
  displayPrice: string
  productId: string
  popular: boolean
}

export function CreditPacks({ packs }: { packs: CreditPack[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
      {packs.map((pack) => (
        <PackCard key={pack.name} pack={pack} />
      ))}
    </div>
  )
}

function PackCard({ pack }: { pack: CreditPack }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    try {
      await checkout({
        products: [pack.productId],
      })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {pack.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-foreground text-background text-xs px-2 py-0.5 pixel-corners pixel-border-foreground">
          Best Value
        </span>
      )}
      <div className="flex flex-col items-center gap-4 p-6 pixel-corners pixel-border-foreground bg-background">
        <p className="text-xl">{pack.name}</p>
        <div className="flex items-center gap-2">
          <Image src="/coin.svg" width={24} height={24} alt="Credit" />
          <p className="text-2xl">
            {pack.credits} Credit{pack.credits === 1 ? '' : 's'}
          </p>
        </div>
        <p className="text-lg text-shadow">{pack.displayPrice}</p>
        <Button
          className="w-full"
          onClick={handleBuy}
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Buy'}
        </Button>
      </div>
    </div>
  )
}

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getError } from '@/lib/error'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function ErrorHandler() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const error = searchParams.get('e')

  useEffect(() => {
    if (error) {
      toast.error(getError(parseInt(error)))
      router.push(pathname)
    }
  }, [error, pathname, router])

  return null
}

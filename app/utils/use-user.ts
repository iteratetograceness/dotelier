import { useEffect, useState } from 'react'
import { supabase } from '@/app/db/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

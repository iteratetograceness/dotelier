import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

let supabase: ReturnType<typeof createServerClient<Database>>

export async function createClient() {
  if (supabase) return supabase

  const cookieStore = await cookies()

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  supabase = client
  return client
}

// export const supabase = await createClient()

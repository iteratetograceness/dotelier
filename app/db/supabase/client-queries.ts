import { supabase } from './client'

export async function isSignedIn() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session?.user !== null
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/'
}

export async function signIn({ path }: { path?: string }) {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${path}`,
    },
  })
}

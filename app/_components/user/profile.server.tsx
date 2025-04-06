import { getSession } from '@/lib/auth/session'
import { UserProfile as UserProfileClient } from './profile.client'

export async function UserProfile() {
  const session = await getSession()
  return session ? <UserProfileClient /> : null
}

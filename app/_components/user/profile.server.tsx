import { credits } from '@/app/utils/credits'
import { getSession } from '@/lib/auth/session'
import { UserProfile as UserProfileClient } from './profile.client'

export async function UserProfile() {
  const session = await getSession()
  const creditsPromise = credits.get(session?.user.id)
  return session ? (
    <UserProfileClient user={session.user} creditsPromise={creditsPromise} />
  ) : null
}

import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { AdminClient } from './client'

export async function Admin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return <AdminClient />
  }

  const authorized = await verifyToken(token)

  return <AdminClient authorized={authorized} />
}

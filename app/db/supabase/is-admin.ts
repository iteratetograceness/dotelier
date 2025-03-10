'server-only'

const ADMINS = ['graceyunn@gmail.com']

export function isAdmin(email?: string) {
  if (!email) return false
  return ADMINS.includes(email)
}

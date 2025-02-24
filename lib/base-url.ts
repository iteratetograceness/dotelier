export function getBaseUrl(path?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  return path ? `${baseUrl}${path}` : baseUrl
}

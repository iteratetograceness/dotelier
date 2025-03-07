export function getBaseUrl(path?: string) {
  const baseUrl =
    process.env.VERCEL_ENV === 'production'
      ? 'https://dotelier.studio'
      : process.env.VERCEL_ENV === 'preview'
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  return path ? `${baseUrl}${path}` : baseUrl
}

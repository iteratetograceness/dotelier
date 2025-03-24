export function getBaseUrl(path?: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'https://www.dotelier.studio'
      : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? `https://www.${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000'
  return path ? `${baseUrl}${path}` : baseUrl
}

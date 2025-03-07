const PUBLIC_URL = process.env.NEXT_PUBLIC_STORAGE_URL

export function getPublicPixelAsset(filePath: string) {
  return `${PUBLIC_URL}/${filePath}`
}

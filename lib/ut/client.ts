export function getPublicPixelAsset(fileKey: string) {
  return `https://${process.env.NEXT_PUBLIC_UT_APP_ID}.ufs.sh/f/${fileKey}`
}

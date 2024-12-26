import { get } from '@vercel/edge-config'

export interface Style {
  id: string
  description: string
}

if (!process.env.DEFAULT_STYLE_ID) {
  throw new Error('DEFAULT_STYLE_ID must be set')
}

const defaultStyleId = process.env.DEFAULT_STYLE_ID

export async function getRandomStyleId(): Promise<string> {
  const styles = await get<Style[]>('styles')

  if (!styles) return defaultStyleId

  const randomIndex = Math.floor(Math.random() * styles.length)

  return styles[randomIndex].id
}

export async function getStyles(): Promise<Style[] | undefined> {
  return await get<Style[]>('styles')
}

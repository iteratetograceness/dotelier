import { supabase } from './client'

export function getPublicPixelAsset(filePath: string) {
  const { data } = supabase.storage.from('icons').getPublicUrl(filePath)
  return data.publicUrl
}

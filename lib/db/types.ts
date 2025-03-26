import { Privacy } from 'kysely-codegen'

export interface Pixel {
  createdAt: Date
  id: string
  privacy: Privacy
  prompt: string
  showExplore: boolean
  updatedAt: Date | null
  userId: string
}

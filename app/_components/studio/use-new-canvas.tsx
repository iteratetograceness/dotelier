import { PixelApiResponse } from '@/app/pixel-api/types'
import { create } from 'zustand'

interface NewCanvasState {
  status: 'idle' | 'generating' | 'pre-processing' | 'completed' | 'error'
  active: boolean
  prompt: string
  result?: PixelApiResponse
  id: string
}

type NewCanvasActions = {
  startGeneration: (prompt: string, id: string) => void
  setStatus: (status: NewCanvasState['status']) => void
  reset: () => void
  setActive: (active: boolean) => void
}

export const useNewCanvas = create<NewCanvasState & NewCanvasActions>((set) => ({
  status: 'idle',
  active: true,
  prompt: '',
  id: '',
  startGeneration: (prompt: string) => set({ status: 'generating', prompt }),
  setStatus: (status: NewCanvasState['status']) => set({ status }),
  reset: () => set({ status: 'idle', prompt: '' }),
  setActive: (active: boolean) => set({ active }),
}))

import { generatePixelIcon } from '@/app/pixel-api/generate'
import { PixelApiResponse } from '@/app/pixel-api/types'
import { getError } from '@/lib/error'
import { create } from 'zustand'

interface NewCanvasState {
  status: 'idle' | 'generating' | 'post-processing' | 'completed' | 'error'
  prompt: string
  result?: PixelApiResponse
  error?: string
  id: string
}

type NewCanvasActions = {
  startGeneration: (prompt: string) => Promise<void>
  setStatus: (status: NewCanvasState['status']) => void
  setId: (id: string) => void
  reset: () => void
}

export const useNewCanvas = create<NewCanvasState & NewCanvasActions>(
  (set) => ({
    status: 'idle',
    prompt: '',
    id: '',
    error: '',
    startGeneration: async (prompt: string) => {
      set({ status: 'generating', prompt })
      const result = await generatePixelIcon({ prompt })

      if (result.success) {
        set({ status: 'post-processing', result: result.result, id: result.id })
      } else {
        const error = getError(result.error)
        set({ status: 'error', error })
      }
    },
    setStatus: (status: NewCanvasState['status']) => set({ status }),
    setId: (id: string) => set({ id }),
    reset: () =>
      set({ status: 'idle', prompt: '', result: undefined, id: '', error: '' }),
  })
)

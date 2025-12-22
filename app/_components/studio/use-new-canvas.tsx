import { generatePixelIcon } from '@/app/pixel-api/generate'
import { ModelType, PixelApiResponse } from '@/app/pixel-api/types'
import { getError } from '@/lib/error'
import { create } from 'zustand'

interface NewCanvasState {
  status: 'idle' | 'generating' | 'post-processing' | 'completed' | 'error'
  prompt: string
  model: ModelType
  result?: PixelApiResponse
  error?: string
  id: string
  noBgPngUrl?: string
}

type NewCanvasActions = {
  startGeneration: (prompt: string) => Promise<void>
  setStatus: (status: NewCanvasState['status']) => void
  setId: (id: string) => void
  setModel: (model: ModelType) => void
  reset: () => void
}

export const useNewCanvas = create<NewCanvasState & NewCanvasActions>(
  (set, get) => ({
    status: 'idle',
    prompt: '',
    model: 'flux',
    id: '',
    error: '',
    startGeneration: async (prompt: string) => {
      try {
        // Generate image + remove background + save pixel version (all server-side)
        // The editor will use unfake's processImage client-side for scale detection & downscaling
        const { model } = get()
        set({ status: 'generating', prompt })
        const generateResult = await generatePixelIcon({ prompt, model })

        if (!generateResult.success) {
          const error = getError(generateResult.error)
          set({ status: 'error', error })
          return
        }

        set({
          status: 'completed',
          result: generateResult.result,
          id: generateResult.id,
          noBgPngUrl: generateResult.noBgPngUrl,
        })
      } catch (error) {
        console.error('[startGeneration] Error:', error)
        set({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    setStatus: (status: NewCanvasState['status']) => set({ status }),
    setId: (id: string) => set({ id }),
    setModel: (model: ModelType) => set({ model }),
    reset: () =>
      set({
        status: 'idle',
        prompt: '',
        result: undefined,
        id: '',
        error: '',
        noBgPngUrl: undefined,
      }),
  })
)

import { generatePixelIcon } from '@/app/pixel-api/generate'
import { ModelType, PixelApiResponse } from '@/app/pixel-api/types'
import { getError } from '@/lib/error'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewCanvasState {
  status: 'idle' | 'generating' | 'post-processing' | 'completed' | 'error'
  prompt: string
  model: ModelType
  result?: PixelApiResponse
  error?: string
  id: string
  noBgPngUrl?: string
  /** Whether there's an active generation promise running in this session */
  _isGenerationActive: boolean
}

type NewCanvasActions = {
  startGeneration: (prompt: string) => Promise<void>
  setStatus: (status: NewCanvasState['status']) => void
  setId: (id: string) => void
  setModel: (model: ModelType) => void
  reset: () => void
}

export const useNewCanvas = create<NewCanvasState & NewCanvasActions>()(
  persist(
    (set, get) => ({
      status: 'idle',
      prompt: '',
      model: 'flux',
      id: '',
      error: '',
      _isGenerationActive: false,
      startGeneration: async (prompt: string) => {
        if (get()._isGenerationActive) return

        try {
          // Generate image + remove background + save pixel version (all server-side)
          // The editor will use pixel-snapper (WASM) client-side for grid detection & snapping
          const { model } = get()
          set({ status: 'generating', prompt, _isGenerationActive: true })
          const generateResult = await generatePixelIcon({ prompt, model })

          if (!generateResult.success) {
            const error = getError(generateResult.error)
            set({ status: 'error', error, _isGenerationActive: false })
            return
          }

          set({
            status: 'completed',
            result: generateResult.result,
            id: generateResult.id,
            noBgPngUrl: generateResult.noBgPngUrl,
            _isGenerationActive: false,
          })
        } catch (error) {
          console.error('[startGeneration] Error:', error)
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            _isGenerationActive: false,
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
          _isGenerationActive: false,
        }),
    }),
    {
      name: 'dotelier-generation',
      partialize: (state) => ({
        status: state.status,
        prompt: state.prompt,
        model: state.model,
        result: state.result,
        id: state.id,
        noBgPngUrl: state.noBgPngUrl,
        // Don't persist _isGenerationActive — it should be false on hydration
        // so the recovery logic knows the promise is gone
      }),
    }
  )
)

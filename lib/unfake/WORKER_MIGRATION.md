# Unfake Web Worker Migration Plan

This document outlines the plan to migrate `processImage` from unfake to run in a Web Worker for improved performance.

## Current Architecture

```
Main Thread
───────────────────────────────────────────────────
loadImageWithUnfake()
  ├── fetch blob
  ├── processImage()          ← BLOCKING (heavy CPU)
  │     ├── OpenCV operations
  │     ├── Color quantization
  │     ├── SVD calculations
  │     └── Downscaling
  └── Apply to renderer/history
```

The `processImage` call blocks the main thread, causing UI jank during image processing.

## Target Architecture

```
Main Thread                         Worker Thread
────────────────────────────────   ────────────────────────────
loadImageWithUnfake()
  ├── fetch blob
  ├── postMessage(blob) ─────────► Worker receives blob
  │                                 ├── processImage()
  │                                 │     ├── OpenCV ops
  │                                 │     ├── Quantization
  │                                 │     └── Downscaling
  │   ◄──────────────────────────── postMessage(ImageData)
  └── Apply to renderer/history
```

## Audit Results

### DOM Dependencies Found

| File | Line | Code | Worker Compatible? |
|------|------|------|-------------------|
| `utils.ts` | 94-97 | `OffscreenCanvas` with `document.createElement` fallback | **Yes** - Already uses OffscreenCanvas when available |
| `pixel.ts` | 737 | `document.createElement('canvas')` | **No** - Needs conversion |

### Library Compatibility

| Library | Worker Compatible? | Notes |
|---------|-------------------|-------|
| `@techstark/opencv-js` | **Yes** | Can be loaded in workers, needs initialization |
| `image-q` | **Yes** | Pure JavaScript, no DOM dependencies |
| `upng-js` | **Yes** | Pure JavaScript |
| `svd-js` | **Yes** | Pure math |
| `imagetracerjs` | **Partial** | Used in `vector.ts`, not in `processImage` |

### Functions to Migrate

#### Fully Compatible (no changes needed)
- `alphaBinarization` - Pure data manipulation
- `jaggyCleaner` - Pure data manipulation
- `finalizePixels` - Pure data manipulation
- `countColors` - Pure data manipulation
- `getPaletteFromImage` - Pure data manipulation
- `quantizeImage` - Uses image-q (pure JS)
- `encodePng` - Uses UPNG (pure JS)
- `downscaleBlock` - Pure data manipulation
- `downscaleByDominantColor` - Pure data manipulation
- `_contentAdaptiveCore` - Pure math + OpenCV
- All math helpers (`median`, `mode`, `mean`, etc.)

#### Needs Minor Changes
- `fileToImageData` (utils.ts:71-113)
  - Already handles OffscreenCanvas
  - **Change**: Remove fallback to `document.createElement`, throw if OffscreenCanvas unavailable

- `processImage` snap grid section (pixel.ts:737-743)
  - Uses `document.createElement('canvas')`
  - **Change**: Use `OffscreenCanvas` instead

#### OpenCV Functions (needs worker initialization)
- `withCv` - Resource management wrapper
- `morphologicalCleanup`
- `detectOptimalColorCount`
- `findOptimalCrop`
- `contentAdaptiveDownscale`
- `edgeAwareDetect` / `legacyEdgeAwareDetect`

## Implementation Steps

### Phase 1: Make Code Worker-Safe

1. **Update `fileToImageData`** to require OffscreenCanvas:
   ```typescript
   // Before
   const canvas = typeof OffscreenCanvas !== 'undefined'
     ? new OffscreenCanvas(bitmap.width, bitmap.height)
     : document.createElement('canvas')

   // After
   if (typeof OffscreenCanvas === 'undefined') {
     throw new Error('OffscreenCanvas required for worker processing')
   }
   const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
   ```

2. **Update snap grid in `processImage`** (pixel.ts:737):
   ```typescript
   // Before
   const canvas = document.createElement('canvas')

   // After
   const canvas = new OffscreenCanvas(croppedMat.cols, croppedMat.rows)
   ```

3. **Remove `'use client'`** from utils.ts (line 1) - not needed for worker code

### Phase 2: Create Worker File

Create `lib/unfake/worker.ts`:

```typescript
import { processImage } from './pixel'

interface WorkerMessage {
  type: 'process'
  id: string
  file: Blob
  options: ProcessImageOptions
}

interface WorkerResponse {
  type: 'result' | 'error'
  id: string
  result?: {
    imageData: ImageData
    palette: string[]
    manifest: object
  }
  error?: string
}

// Pre-initialize OpenCV on worker start
let cvReady = false
import('./utils').then(({ cvReady: initCv }) => {
  initCv().then(() => { cvReady = true })
})

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id, file, options } = e.data

  if (type !== 'process') return

  try {
    // Wait for OpenCV if not ready
    while (!cvReady) {
      await new Promise(r => setTimeout(r, 50))
    }

    const result = await processImage({ file, ...options })

    // Transfer ImageData buffer for zero-copy
    const response: WorkerResponse = {
      type: 'result',
      id,
      result: {
        imageData: result.imageData,
        palette: result.palette,
        manifest: result.manifest
      }
    }

    self.postMessage(response, [result.imageData.data.buffer])
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    self.postMessage(response)
  }
}
```

### Phase 3: Create Worker Manager

Create `lib/unfake/worker-manager.ts`:

```typescript
type PendingRequest = {
  resolve: (result: ProcessResult) => void
  reject: (error: Error) => void
}

class UnfakeWorkerManager {
  private worker: Worker | null = null
  private pending = new Map<string, PendingRequest>()
  private idCounter = 0

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' }
      )
      this.worker.onmessage = this.handleMessage.bind(this)
      this.worker.onerror = this.handleError.bind(this)
    }
    return this.worker
  }

  private handleMessage(e: MessageEvent<WorkerResponse>) {
    const { type, id, result, error } = e.data
    const pending = this.pending.get(id)
    if (!pending) return

    this.pending.delete(id)

    if (type === 'error') {
      pending.reject(new Error(error))
    } else {
      pending.resolve(result!)
    }
  }

  private handleError(e: ErrorEvent) {
    console.error('[UnfakeWorker] Error:', e.message)
    // Reject all pending requests
    for (const [id, pending] of this.pending) {
      pending.reject(new Error('Worker error'))
      this.pending.delete(id)
    }
    // Recreate worker
    this.worker?.terminate()
    this.worker = null
  }

  async process(file: Blob, options: ProcessImageOptions): Promise<ProcessResult> {
    const id = `req_${++this.idCounter}`
    const worker = this.getWorker()

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      worker.postMessage({ type: 'process', id, file, options })
    })
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
  }
}

export const unfakeWorker = new UnfakeWorkerManager()
```

### Phase 4: Update Editor Integration

Update `loadImageWithUnfake` in `editor/index.ts`:

```typescript
public async loadImageWithUnfake(imageUrl: string): Promise<void> {
  console.log('[loadImageWithUnfake] Starting for:', imageUrl)

  const response = await fetch(imageUrl)
  const blob = await response.blob()

  if (blob.type === 'image/svg+xml') {
    await this.loadSVG2(imageUrl)
    return
  }

  console.log('[loadImageWithUnfake] Processing with unfake worker...')

  // Use worker instead of direct import
  const { unfakeWorker } = await import('@/lib/unfake/worker-manager')

  const result = await unfakeWorker.process(blob, {
    maxColors: 32,
    downscaleMethod: 'content-adaptive',
    cleanup: { morph: false, jaggy: true },
    alphaThreshold: 128,
    snapGrid: true,
  })

  // Rest of the function remains the same...
}
```

## Performance Considerations

### Transferable Objects
Use `postMessage` with transferable objects for zero-copy transfer:
- `ImageData.data.buffer` (ArrayBuffer) can be transferred
- After transfer, the buffer is no longer accessible in the sender

### Worker Warm-up
OpenCV initialization takes ~100-200ms. Options:
1. **Lazy init**: First request waits for init (current plan)
2. **Eager init**: Pre-warm worker on page load
3. **Shared worker**: Single worker across tabs

### Memory Management
- OpenCV Mats must be deleted manually (handled by `withCv`)
- Worker can be terminated when not needed to free memory
- Consider max concurrent workers for heavy usage

## Browser Support

| Browser | OffscreenCanvas | Module Workers | Status |
|---------|----------------|----------------|--------|
| Chrome 69+ | Yes | Yes | Full support |
| Firefox 105+ | Yes | Yes | Full support |
| Safari 16.4+ | Yes | Yes | Full support |
| Edge 79+ | Yes | Yes | Full support |

For older browsers, fall back to main thread processing.

## Testing Checklist

- [ ] Unit tests for worker-safe functions
- [ ] Integration test: worker processes image correctly
- [ ] Test transferable object handling
- [ ] Test worker error recovery
- [ ] Test concurrent requests
- [ ] Performance benchmark: main thread vs worker
- [ ] Memory leak testing
- [ ] Browser compatibility testing

## Rollout Plan

1. **Feature flag**: Add `useWorker` option to `loadImageWithUnfake`
2. **A/B test**: Compare performance metrics
3. **Gradual rollout**: Enable by default after validation
4. **Fallback**: Keep main thread path for unsupported browsers

## Estimated Effort

| Task | Estimate |
|------|----------|
| Phase 1: Make code worker-safe | 1-2 hours |
| Phase 2: Create worker file | 2-3 hours |
| Phase 3: Create worker manager | 2-3 hours |
| Phase 4: Update editor integration | 1-2 hours |
| Testing & debugging | 3-4 hours |
| **Total** | **9-14 hours** |

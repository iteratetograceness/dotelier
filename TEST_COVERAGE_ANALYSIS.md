# Test Coverage Analysis

## Current State

The codebase has virtually no test coverage:

- **1 E2E test** in `__tests__/home.spec.ts` — checks that the sign-in CTA is visible on the homepage
- **No unit tests**
- **No component tests**
- **No API route tests**
- A stale `bunfig.toml` `[test]` section referencing a non-existent `happydom.ts` preload
- No `test` script in `package.json`

## Recommended Areas for Test Coverage

Ranked by impact and feasibility (highest priority first).

### 1. Pure Algorithmic Logic (unit tests, no mocking needed)

**`app/_components/studio/editor/shapes.ts`** — Bresenham's line algorithm and midpoint circle algorithm:
- `line()`: Verify correct points for horizontal, vertical, diagonal, and arbitrary lines
- `circle()`: Verify symmetry, correct radius, edge cases (radius 0, 1)
- `Point` class: `equals()`, `toString()`, `from()`, `zero()`

**`app/_components/studio/editor/history.ts`** — HistoryManager:
- Undo/redo correctness after multiple actions
- History truncation at `MAX_HISTORY_LENGTH` (50)
- `startAction`/`endAction` lifecycle
- `canUndo()`/`canRedo()` boundary conditions
- History branch pruning (undo then new action discards redo stack)

**`lib/error.ts`** — `getError()` maps error codes to messages:
- Table-driven test ensuring all codes are covered and no cases are missed

### 2. Editor Tool Logic (unit tests with minimal mocking)

**`app/_components/studio/editor/tool.ts`**:
- `BaseTool.setPixel`: Correct buffer offsets, bounds checking, multi-size tool support (1-4px)
- `BaseTool.getPixel`: Correct offset reads, out-of-bounds returns null
- `FillTool.floodFill`: Fills connected region, stops at boundaries, same-color no-op, no overflow on large grids
- `ToolManager`: Tool switching, size clamping (1 to MAX_TOOL_SIZE)

### 3. Credits System (unit tests with mocked Redis/Polar)

**`app/utils/credits.ts`** — Credit deduction priority chain:
- `get()`: Aggregates welcome + refund + Polar credits
- `decrement()`: Waterfall order — refund → welcome → Polar
- `decrement()` returns `false` when all sources exhausted
- `increment()`: Adds to refund bucket
- Edge cases: undefined userId, Polar API errors caught gracefully
- Welcome credit math: `max(FREE_CREDITS - used, 0)`

### 4. API Route Handlers (integration-style tests)

**`app/api/pixels/route.ts`**, **`app/api/credits/route.ts`**:
- Auth guard rejects unauthenticated requests
- Correct pagination parameter pass-through
- Response shape matches expected contract
- Error responses use correct status codes

### 5. Database Query Layer (integration tests)

**`lib/db/queries.ts`** — Transaction logic and cache tagging:
- `_insertPixelVersion`: Atomically sets `isCurrent = false` on old versions and inserts new
- Handles no-previous-version case
- `getExplorePagePixels` pagination logic
- `isPixelOwner` authorization check

### 6. Server Actions (integration tests)

**`app/pixel-api/generate.ts`** — Generation flow:
- Unauthenticated user rejected
- Rate-limited user gets correct error
- No-credits user gets correct error
- Timeout after 90 seconds aborts correctly
- Credit refund on failure

### 7. E2E Tests (expand Playwright coverage)

Priority scenarios:
- Auth flow: Sign in, session persistence, sign out
- Pixel creation: Generate pixel, verify in studio collection
- Editor: Open editor, use pen tool, save, verify persistence
- Explore page: Loads and displays pixel grid

## Infrastructure Recommendations

1. **Add a unit test runner**: Install `vitest` (works with Bun and Next.js). Wire up properly or replace the stale `bunfig.toml` test config.

2. **Add test scripts to `package.json`**:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:e2e": "playwright test"
   ```

3. **Fix or remove the stale `bunfig.toml` test config** referencing non-existent `happydom.ts`.

4. **Set up CI** — Playwright config already has CI-aware settings. Add a GitHub Actions workflow running unit + E2E tests.

5. **Test file colocation**: Place unit tests alongside source files (`shapes.test.ts` next to `shapes.ts`). Reserve `__tests__/` for E2E tests.

## Suggested First Tests (Priority Order)

| Priority | File | Test Type | Effort | Value |
|----------|------|-----------|--------|-------|
| 1 | `shapes.ts` (line, circle) | Unit | Low | High — pure algorithms |
| 2 | `history.ts` (HistoryManager) | Unit | Low | High — undo/redo is UX-critical |
| 3 | `tool.ts` (flood fill, setPixel) | Unit | Medium | High — core editor correctness |
| 4 | `credits.ts` (Credits class) | Unit + mocks | Medium | High — billing logic |
| 5 | `error.ts` (getError) | Unit | Trivial | Low but free |
| 6 | API routes | Integration | Medium | Medium — contract verification |
| 7 | `generate.ts` (generation flow) | Integration | High | High — critical user flow |

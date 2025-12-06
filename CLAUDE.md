# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**This project uses [Bun](https://bun.sh) as the primary package manager.**
- Lock file: `bun.lock` (committed to version control)
- Config: `bunfig.toml`
- Install: `bun install`

npm commands are supported for compatibility, but `bun` is preferred.

## Development Commands

- **Development**: `bun dev` (uses Turbopack for faster builds)
- **Build**: `bun build` (production build)
- **Type Check**: `bun type-check` (TypeScript check without emit)
- **Lint**: `bun lint` (Next.js ESLint)
- **Generate Types**: `bun generate-types` (Kysely database types from Postgres - requires DATABASE_URL)
- **Unused Code**: `bun knip` (finds unused exports and dependencies)
- **Debug Memory**: `bun debug` (Next.js build with memory debugging)

### Type Generation

The project uses `kysely-codegen` to generate TypeScript types from the PostgreSQL database schema. The generated types are defined in `kysely-codegen.d.ts` and should be committed to version control.

**To regenerate types after schema changes:**
```bash
bun generate-types  # Requires DATABASE_URL environment variable
```

**Note:** Type generation is NOT run automatically during builds to avoid requiring database access at build time. Types are pre-generated and committed to the repository.

## Architecture Overview

### Core Technology Stack
- **Framework**: Next.js 15 with App Router (experimental PPR, dynamicIO, React Compiler)
- **Database**: PostgreSQL with Kysely query builder and type generation
- **Auth**: Better Auth with Polar.sh integration, Google OAuth, Redis session storage
- **Storage**: UploadThing for file uploads, Upstash Redis for caching/sessions
- **AI**: Replicate API for image generation and post-processing
- **UI**: Tailwind CSS 4, Radix UI, custom pixel editor
- **State**: Zustand, SWR for data fetching

### Database Layer (`lib/db/`)
- `pg.ts`: Neon PostgreSQL connection with Kysely
- `queries.ts`: Cached database queries using React's `cache()` and `unstable_cacheTag`
- `types.ts`: Auto-generated Kysely types via `kysely-codegen`

Key patterns:
- All queries are cached and tagged for Next.js revalidation
- Transactions used for complex operations (pixel version updates)
- Server-only queries with `'server-only'` directive

### Authentication (`lib/auth/`)
- Better Auth with Polar.sh plugin for customer management
- JWT tokens with custom payload structure
- Redis secondary storage for session data
- Google OAuth social provider

### Pixel Art Editor (`app/_components/studio/editor/`)
Core pixel art editing system with:
- `PixelEditor`: Main editor class managing canvas, tools, and history
- `PixelRenderer`: WebGL-based rendering with grid overlay
- `ToolManager`: Pen, eraser, fill, line, and eye-dropper tools
- `HistoryManager`: Undo/redo with action batching
- SVG import/export with quantization for pixel art conversion

### API Structure (`app/api/`)
- `/auth/[...all]`: Better Auth endpoints
- `/pixels/[id]/latest`: Get latest pixel version
- `/post-processing/[id]`: Handle background removal processing

### Pixel Workflow
1. Create pixel via `createPixel()` 
2. Upload via UploadThing → `insertPixelVersion()`
3. Optional post-processing via Replicate API
4. Version management with `isCurrent` flags

### File Organization
- `app/`: Next.js App Router pages and components
- `lib/`: Shared utilities, database, auth, external APIs
- `app/_components/`: Reusable UI components organized by feature
- `app/swr/`: SWR hooks and shared data fetching logic

### Environment Configuration
Requires:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth
- `POLAR_ACCESS_TOKEN`: Customer management
- `DATABASE_URL`: Neon PostgreSQL
- `UPSTASH_REDIS_*`: Session storage
- `UPLOADTHING_*`: File uploads
- `REPLICATE_API_TOKEN`: AI processing

## To-do's

- [ ] Explore page
- [ ] My collection page
- [ ] Full page editor
- [ ] Explain conversion to canvas is not 1:1
- [ ] Better pen size logic
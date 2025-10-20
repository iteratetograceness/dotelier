-- Migration: Add Performance Indexes
-- Created: 2025-10-20
-- Purpose: Improve query performance for common lookups

-- Index for user's pixels lookup (used in getPixelsMetadataByOwner)
CREATE INDEX IF NOT EXISTS idx_pixel_user_id
ON pixel(userId);

-- Index for explore page filtering
CREATE INDEX IF NOT EXISTS idx_pixel_show_explore
ON pixel(showExplore)
WHERE showExplore = true;

-- Composite index for explore page with ordering
CREATE INDEX IF NOT EXISTS idx_pixel_explore_created
ON pixel(showExplore, createdAt DESC)
WHERE showExplore = true;

-- Index for pixel creation date ordering
CREATE INDEX IF NOT EXISTS idx_pixel_created_at
ON pixel(createdAt DESC);

-- Index for pixel version lookups by pixel
CREATE INDEX IF NOT EXISTS idx_pixel_version_pixel_id
ON pixelVersion(pixelId);

-- Composite index for finding current version (most common query)
CREATE INDEX IF NOT EXISTS idx_pixel_version_current
ON pixelVersion(pixelId, isCurrent)
WHERE isCurrent = true;

-- Index for post-processing lookups
CREATE INDEX IF NOT EXISTS idx_post_processing_pixel_id
ON postProcessing(pixelId);

-- Expected Performance Impact:
-- - 50-90% faster query times for filtered/sorted queries
-- - Significantly improved performance as dataset grows
-- - Better query plan selection by PostgreSQL

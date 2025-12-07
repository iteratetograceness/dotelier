-- Add gridSize column to pixelVersion table
-- Nullable with default 32 for backwards compatibility with existing records
ALTER TABLE "pixelVersion" ADD COLUMN "gridSize" INTEGER DEFAULT 32;

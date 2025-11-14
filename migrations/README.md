# Database Migrations

This directory contains SQL migrations for the Dotelier database.

## How to Apply Migrations

### Using psql (recommended)

```bash
# Connect to your database and run the migration
psql $DATABASE_URL -f migrations/001_add_performance_indexes.sql
```

### Using Neon Console

1. Go to your Neon console
2. Navigate to the SQL Editor
3. Copy and paste the contents of the migration file
4. Execute the query

### Verify Indexes

After applying the migration, verify the indexes were created:

```sql
-- List all indexes on the pixel table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pixel';

-- List all indexes on the pixelVersion table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pixelVersion';

-- List all indexes on the postProcessing table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'postProcessing';
```

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 001_add_performance_indexes.sql | 2025-10-20 | Add indexes for common query patterns |

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- Indexes are created concurrently when possible to avoid locking
- Partial indexes are used for filtered queries to reduce index size

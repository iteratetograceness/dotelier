import { Pool } from '@neondatabase/serverless'
import { Kysely, PostgresDialect } from 'kysely'
import { DB } from 'kysely-codegen'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Fail fast if can't get connection in 2s
  }),
})

export const db = new Kysely<DB>({
  dialect,
})

import { Pool } from '@neondatabase/serverless'
import { Kysely, PostgresDialect } from 'kysely'
import { DB } from 'kysely-codegen'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: process.env.DATABASE_URL }),
})

export const db = new Kysely<DB>({
  dialect,
})

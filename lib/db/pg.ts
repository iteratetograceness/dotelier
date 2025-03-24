import { Kysely } from 'kysely'
import { DB } from 'kysely-codegen'
import { NeonDialect, NeonHTTPDialect } from 'kysely-neon'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const standardDialect = new NeonDialect({
  connectionString: process.env.DATABASE_URL,
})

export const standardDb = new Kysely<DB>({
  dialect: standardDialect,
})

export const fastDb = new Kysely<DB>({
  dialect: new NeonHTTPDialect({
    connectionString: process.env.DATABASE_URL || '',
  }),
})

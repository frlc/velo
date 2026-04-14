import dns from 'node:dns'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first')
}

const connectionString =
  process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Defina E2E_DATABASE_URL ou DATABASE_URL no .env (Playwright carrega o .env a partir da raiz do projeto).'
  )
}

const useSsl =
  connectionString.includes('supabase.co') ||
  connectionString.includes('pooler.supabase.com')

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString,
    max: 10,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  }),
})
export const db = new Kysely<Database>({
  dialect,
})
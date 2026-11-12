// Shared Turso (hosted SQLite / libSQL) client for /spr and the VARTA readings pushed from home.
//
//   TURSO_DATABASE_URL="libsql://spr-you.turso.io"  added by Vercel's Turso integration
//   TURSO_AUTH_TOKEN="..."
//
// Without TURSO_DATABASE_URL, development uses a local SQLite file (.data/spr.db).

import { createClient } from '@libsql/client'
import { mkdirSync } from 'fs'

let db = null

export function database() {
  if (db) return db
  let url = process.env.TURSO_DATABASE_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') throw new Error('TURSO_DATABASE_URL is not set')
    mkdirSync('.data', { recursive: true })
    url = 'file:.data/spr.db'
  }
  db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  return db
}

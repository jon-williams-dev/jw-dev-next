// VARTA readings pushed from home, for the public site, which can't reach the battery.
//
// A script on the home network (scripts/varta_push.mjs) reads the battery and POSTs the
// latest status every few seconds and the history for each range every minute to
// /api/varta/push. They're kept in Turso as JSON snapshots, one row each, so serving
// a page costs one row read and no aggregation.
//
//   VARTA_PUSH_KEY="some-long-random-string"  shared by the site and the home script
//
// Enabled where VARTA_PUSH_KEY is set and VARTA_HOST isn't (at home, the battery is read directly).

import { database } from './db'
import { vartaConfig } from './varta'

export const remoteEnabled = () => !vartaConfig() && Boolean(process.env.VARTA_PUSH_KEY)

let ready = null
const setup = () => ready ??= database().execute(
  'CREATE TABLE IF NOT EXISTS varta_snapshots (name TEXT PRIMARY KEY, body TEXT NOT NULL, updated_at INTEGER NOT NULL)'
).catch((err) => { ready = null; throw err })

export async function saveSnapshots(entries) {
  await setup()
  const now = Date.now()
  await database().batch(entries.map(([name, value]) => ({
    sql: `INSERT INTO varta_snapshots (name, body, updated_at) VALUES (?, ?, ?)
          ON CONFLICT (name) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`,
    args: [name, JSON.stringify(value), now],
  })), 'write')
}

export async function loadSnapshot(name) {
  await setup()
  const { rows } = await database().execute({ sql: 'SELECT body FROM varta_snapshots WHERE name = ?', args: [name] })
  return rows.length ? JSON.parse(rows[0].body) : null
}

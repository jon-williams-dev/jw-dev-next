// Saved projects for /jw-overlap, in Turso (hosted SQLite / libSQL) like /spr.
//
//   OVERLAP_KEY="some-long-random-string"   optional: locks it to that key (x-overlap-key header)
//
// Without OVERLAP_KEY it's open, so every browser sees the same projects with no setup. With it,
// the page picks the key up once from /jw-overlap?key=... and remembers it. Either way the page
// keeps a copy in the browser for when it's offline.
//
// Everything is one JSON document ({ projects, currentId }) with a version number. A save must
// name the version it was based on, so two devices can't silently overwrite each other: a stale
// save gets 409 and the latest copy back.
//
//   GET                       { data, version, updated }  (data null before the first save)
//   PUT { data, version }     { version, updated }, or 409 { data, version, updated }
import { createHash, timingSafeEqual } from 'crypto'
import { database } from '../../lib/db'

// Run next to the database rather than Vercel's default US region.
export const config = { regions: ['fra1'] }

const MAX_BYTES = 900 * 1024

const SCHEMA = `CREATE TABLE IF NOT EXISTS overlap_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    version INTEGER NOT NULL,
    updated TEXT NOT NULL
)`

let ready = null
const schema = () => (ready ??= database().execute(SCHEMA).catch((err) => { ready = null; throw err }))

const digest = (s) => createHash('sha256').update(String(s)).digest()

function authorised(req) {
    const key = process.env.OVERLAP_KEY
    if (!key) return true
    return timingSafeEqual(digest(req.headers['x-overlap-key'] || ''), digest(key))
}

async function current() {
    const { rows } = await database().execute('SELECT data, version, updated FROM overlap_state WHERE id = 1')
    const row = rows[0]
    return row ? { data: JSON.parse(row.data), version: Number(row.version), updated: row.updated } : { data: null, version: 0, updated: null }
}

const valid = (data) => data && typeof data === 'object' && Array.isArray(data.projects)
    && data.projects.every((p) => p && typeof p.id === 'string' && Array.isArray(p.items))

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (!authorised(req)) return res.status(401).json({ error: 'That key doesn’t open these projects', code: 'unauthorised' })

    try {
        await schema()
        if (req.method === 'GET') return res.status(200).json(await current())

        if (req.method === 'PUT') {
            const { data, version } = req.body || {}
            if (!valid(data) || !Number.isInteger(version)) return res.status(400).json({ error: 'Expected { data: { projects }, version }' })
            const text = JSON.stringify(data)
            if (Buffer.byteLength(text) > MAX_BYTES) return res.status(413).json({ error: 'That’s too much to save in one go' })

            const updated = new Date().toISOString()
            // Inserts the first copy, or replaces the saved one only if it's still the version the
            // page started from.
            const result = await database().execute({
                sql: `INSERT INTO overlap_state (id, data, version, updated) VALUES (1, ?, 1, ?)
                      ON CONFLICT (id) DO UPDATE SET data = excluded.data, version = overlap_state.version + 1, updated = excluded.updated
                      WHERE overlap_state.version = ?`,
                args: [text, updated, version],
            })
            const latest = await current()
            if (!result.rowsAffected) return res.status(409).json({ error: 'Changed on another device', ...latest })
            return res.status(200).json({ version: latest.version, updated: latest.updated })
        }

        res.setHeader('Allow', 'GET, PUT')
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (err) {
        console.error('overlap:', err.message)
        return res.status(500).json({ error: 'Couldn’t reach the database' })
    }
}

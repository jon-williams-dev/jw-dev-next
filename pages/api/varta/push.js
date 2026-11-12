// Readings pushed from the home network by scripts/varta_push.mjs (see lib/varta_remote.js).
//
//   POST  Authorization: Bearer $VARTA_PUSH_KEY
//         { status?: <GET /api/varta/status body>, history?: { '1h': <GET /api/varta/history body>, ... } }

import { createHash, timingSafeEqual } from 'crypto'
import { RANGES } from '../../../lib/varta_history'
import { saveSnapshots } from '../../../lib/varta_remote'

const digest = (s) => createHash('sha256').update(s).digest()

function authorized(req) {
    const key = process.env.VARTA_PUSH_KEY
    const sent = (req.headers.authorization || '').replace(/^Bearer /, '')
    return Boolean(key && sent) && timingSafeEqual(digest(sent), digest(key))
}

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (!process.env.VARTA_PUSH_KEY) return res.status(404).json({ error: 'Not enabled' })
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method not allowed' })
    }
    if (!authorized(req)) return res.status(401).json({ error: 'Wrong push key' })

    const { status, history } = req.body || {}
    const entries = []
    if (status !== undefined) {
        if (!isObject(status) || !isObject(status.battery) || !isObject(status.grid) || Number.isNaN(Date.parse(status.timestamp))) {
            return res.status(400).json({ error: 'status needs battery, grid and timestamp' })
        }
        entries.push(['status', status])
    }
    if (history !== undefined) {
        if (!isObject(history)) return res.status(400).json({ error: 'history must be an object of ranges' })
        for (const [range, value] of Object.entries(history)) {
            if (!RANGES[range] || !isObject(value)) return res.status(400).json({ error: `Bad history range: ${range}` })
            entries.push([`history:${range}`, value])
        }
    }
    if (!entries.length) return res.status(400).json({ error: 'Nothing to save' })

    try {
        await saveSnapshots(entries)
        res.status(204).end()
    } catch (err) {
        console.error('Varta push failed:', err.message)
        res.status(500).json({ error: 'Could not save' })
    }
}

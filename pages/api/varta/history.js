// Recorded VARTA history for the /varta charts: bucketed power and charge
// level for the chosen range, plus energy totals per range and per day.
// On the public site this is the copy last pushed from home (lib/varta_remote.js).

import { kioskPaired } from '../../../lib/kiosk_auth'
import { vartaConfig } from '../../../lib/varta'
import { getHistory, RANGES, startCollector } from '../../../lib/varta_history'
import { loadSnapshot, remoteEnabled } from '../../../lib/varta_remote'

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }
    const range = RANGES[req.query.range] ? req.query.range : '24h'

    if (remoteEnabled()) {
        if (!kioskPaired(req)) return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
        try {
            const history = await loadSnapshot(`history:${range}`)
            return history ? res.status(200).json(history) : res.status(503).json({ error: 'No history from home yet' })
        } catch (err) {
            console.error('Varta history snapshot failed:', err.message)
            return res.status(500).json({ error: 'Could not read history' })
        }
    }

    if (!vartaConfig()) return res.status(404).json({ error: 'Varta monitoring is only available on the home network' })

    startCollector()   // no-op once running; covers servers started before instrumentation existed
    try {
        res.status(200).json(await getHistory(range))
    } catch (err) {
        console.error('Varta history failed:', err.message)
        res.status(500).json({ error: 'Could not read history' })
    }
}

// Recorded VARTA history for the /varta charts: bucketed power and charge
// level for the chosen range, plus energy totals per range and per day.

import { vartaConfig } from '../../../lib/varta'
import { getHistory, RANGES, startCollector } from '../../../lib/varta_history'

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }
    if (!vartaConfig()) return res.status(404).json({ error: 'Varta monitoring is only available on the home network' })

    const range = RANGES[req.query.range] ? req.query.range : '24h'
    startCollector()   // no-op once running; covers servers started before instrumentation existed
    try {
        res.status(200).json(await getHistory(range))
    } catch (err) {
        console.error('Varta history failed:', err.message)
        res.status(500).json({ error: 'Could not read history' })
    }
}

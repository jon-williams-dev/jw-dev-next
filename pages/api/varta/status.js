// Live VARTA battery readings for the /varta dashboard.
// Only enabled where VARTA_HOST is set (i.e. on the home network); everywhere
// else, including the public site, it responds 404.

import { getVartaStatus, vartaConfig } from '../../../lib/varta'

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }
    if (!vartaConfig()) return res.status(404).json({ error: 'Varta monitoring is only available on the home network' })

    try {
        res.status(200).json(await getVartaStatus())
    } catch (err) {
        console.error('Varta read failed:', err.message)
        res.status(503).json({ timestamp: new Date().toISOString(), connected: false, error: err.message })
    }
}

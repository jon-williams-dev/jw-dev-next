// Live VARTA battery readings for the /varta dashboard and Sunbank.
// Where VARTA_HOST is set (the home network) the battery is read directly. On the public
// site the latest reading pushed from home is served instead, to paired devices only
// (lib/varta_remote.js). Anywhere else it responds 404.

import { kioskPaired } from '../../../lib/kiosk_auth'
import { getVartaStatus, vartaConfig } from '../../../lib/varta'
import { loadSnapshot, remoteEnabled } from '../../../lib/varta_remote'

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (remoteEnabled()) {
        if (!kioskPaired(req)) return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
        try {
            const status = await loadSnapshot('status')
            // An old reading still renders; the page shows how long ago it was taken.
            if (status) return res.status(200).json(status)
            return res.status(503).json({ timestamp: new Date().toISOString(), connected: false, error: 'No readings from home yet' })
        } catch (err) {
            console.error('Varta snapshot read failed:', err.message)
            return res.status(503).json({ timestamp: new Date().toISOString(), connected: false, error: 'Could not load the latest reading' })
        }
    }

    if (!vartaConfig()) return res.status(404).json({ error: 'Varta monitoring is only available on the home network' })

    try {
        res.status(200).json(await getVartaStatus())
    } catch (err) {
        console.error('Varta read failed:', err.message)
        res.status(503).json({ timestamp: new Date().toISOString(), connected: false, error: err.message })
    }
}

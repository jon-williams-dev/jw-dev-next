import { optimizeRoute } from '../../lib/route_optimizer'

const MAX_BIKES = 8
const USER_AGENT = 'JW Motorcycle Transport route planner'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const COUNTRY_SUFFIX = /,\s*(germany|deutschland|de|austria|österreich|switzerland|schweiz)\s*$/i
const POSTCODE = /\b\d{4,5}\b\s*/

// Nominatim is strict: e.g. "72108 Kiebingen, Germany" fails but "72108 Kiebingen" works.
const queryVariants = (query) => {
    const noCountry = query.replace(COUNTRY_SUFFIX, '').trim()
    return [...new Set([query.trim(), noCountry, noCountry.replace(POSTCODE, '').trim()])].filter(Boolean)
}

// Nominatim usage policy: max 1 request per second.
let lastRequest = 0
async function nominatim(q) {
    const wait = lastRequest + 1100 - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequest = Date.now()
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
    return (await res.json())[0]
}

async function geocode(query) {
    for (const q of queryVariants(query)) {
        const hit = await nominatim(q)
        if (hit) return { lat: Number(hit.lat), lon: Number(hit.lon), name: hit.display_name }
    }
    throw new Error(`Address not found: "${query}"`)
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { home, bikes, capacity } = req.body || {}
    const valid = (s) => typeof s === 'string' && s.trim() && s.length <= 200
    if (!valid(home) || !Array.isArray(bikes) || !bikes.length || bikes.length > MAX_BIKES
        || bikes.some((b) => !valid(b?.pickup) || !valid(b?.dropoff))) {
        return res.status(400).json({ message: `Enter a home address and 1–${MAX_BIKES} bikes with pickup and drop-off.` })
    }
    const cap = Math.max(1, Math.min(MAX_BIKES, Number(capacity) || 1))

    const addresses = [home, ...bikes.map((b) => b.pickup), ...bikes.map((b) => b.dropoff)]

    try {
        const cache = new Map()
        const points = []
        for (const address of addresses) {
            const key = address.trim().toLowerCase()
            if (!cache.has(key)) cache.set(key, await geocode(address))
            points.push(cache.get(key))
        }

        const coords = points.map((p) => `${p.lon},${p.lat}`).join(';')
        const osrm = await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance,duration`)
        const table = await osrm.json()
        if (!osrm.ok || table.code !== 'Ok') throw new Error('Could not calculate road distances')

        const n = bikes.length
        const order = optimizeRoute(table.distances, n, cap)
        if (!order) throw new Error('No valid route found')

        const legs = order.slice(1).map((to, i) => {
            const from = order[i]
            return {
                from,
                to,
                km: table.distances[from][to] / 1000,
                hours: table.durations[from][to] / 3600,
            }
        })

        return res.status(200).json({
            points: points.map((p, i) => ({ ...p, address: addresses[i] })),
            order,
            legs,
            totalKm: legs.reduce((s, l) => s + l.km, 0),
            totalDriveHours: legs.reduce((s, l) => s + l.hours, 0),
            bikeKm: bikes.map((_, i) => table.distances[i + 1][n + i + 1] / 1000),
        })
    } catch (error) {
        return res.status(502).json({ message: error.message })
    }
}

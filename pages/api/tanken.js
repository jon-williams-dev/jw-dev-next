// Fuel prices via Tankerkönig (MTS-K data, CC BY 4.0): https://creativecommons.tankerkoenig.de
// Get a free API key there and set TANKERKOENIG_API_KEY. Without it the demo key returns fake prices.
const DEMO_KEY = '00000000-0000-0000-0000-000000000002'
const API_KEY = process.env.TANKERKOENIG_API_KEY || DEMO_KEY
const USER_AGENT = 'jon-williams.dev Tanken'
const MAX_RADIUS = 25
const CACHE_TTL = 5 * 60 * 1000 // Tankerkönig asks not to poll more often than every few minutes

const cache = new Map()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function cached(key, fn) {
    const hit = cache.get(key)
    if (hit && hit.expires > Date.now()) return hit.value
    const value = await fn()
    cache.set(key, { value, expires: Date.now() + CACHE_TTL })
    if (cache.size > 500) cache.delete(cache.keys().next().value)
    return value
}

// Nominatim usage policy: max 1 request per second.
let lastRequest = 0
async function geocode(q) {
    const wait = lastRequest + 1100 - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequest = Date.now()
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) throw new Error(`Location search failed (${res.status})`)
    const hit = (await res.json())[0]
    if (!hit) throw new Error(`Location not found: "${q}"`)
    return { lat: Number(hit.lat), lng: Number(hit.lon), name: hit.display_name }
}

async function stations(lat, lng, rad) {
    const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${API_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.ok) throw new Error(data.message || 'Fuel price lookup failed')
    return data.stations.map((s) => ({
        id: s.id,
        name: s.name,
        brand: (s.brand || '').trim() || 'Independent',
        address: `${s.street || ''} ${s.houseNumber || ''}`.trim(),
        place: `${s.postCode || ''} ${s.place || ''}`.trim(),
        lat: s.lat,
        lng: s.lng,
        dist: s.dist,
        isOpen: s.isOpen,
        e5: s.e5 || null,
        e10: s.e10 || null,
        diesel: s.diesel || null,
    }))
}

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

    const { q, lat, lng } = req.query
    const rad = Math.max(1, Math.min(MAX_RADIUS, Number(req.query.rad) || 10))

    try {
        let location
        if (lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
            location = { lat: Number(lat), lng: Number(lng), name: null }
        } else if (typeof q === 'string' && q.trim() && q.length <= 200) {
            location = await cached(`geo:${q.trim().toLowerCase()}`, () => geocode(q.trim()))
        } else {
            return res.status(400).json({ message: 'Please enter a town or postcode.' })
        }

        // Round to ~100m so nearby searches share the cache.
        const la = location.lat.toFixed(3)
        const ln = location.lng.toFixed(3)
        const { list, updated } = await cached(`st:${la}:${ln}:${rad}`, async () => ({ list: await stations(la, ln, rad), updated: Date.now() }))

        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
        res.status(200).json({ location, rad, stations: list, updated, demo: API_KEY === DEMO_KEY })
    } catch (e) {
        res.status(502).json({ message: e.message })
    }
}

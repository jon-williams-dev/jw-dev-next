// Drive times between home and work for /commute, leaving now and over the next 90 minutes,
// from the Google Maps Routes API (live and predicted traffic).
//
//   GOOGLE_ROUTES_API_KEY="..."   a Google Cloud API key with the Routes API enabled
//   COMMUTE_HOME="..."            optional exact addresses; the defaults are the village and
//   COMMUTE_WORK="..."            the street, so no house number has to live in the code
//
// GET ?to=work|home   (?demo=1 returns made-up traffic, no key needed)
//
// Each look-up is one Routes request per departure slot. The answer is cached here and by
// Vercel's CDN for a few minutes, so however often the page is opened it costs at most
// SLOTS.length requests per direction per CACHE_MS, and DAILY_LIMIT caps a bad day.
import { demoSlots } from '../../lib/commute'

// Pasted keys sometimes keep their quotes or a stray space.
const API_KEY = (process.env.GOOGLE_ROUTES_API_KEY || '').trim().replace(/^(['"])(.*)\1$/, '$2').trim()
const ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes'
const FIELDS = 'routes.duration,routes.staticDuration,routes.distanceMeters,routes.description,routes.routeLabels,routes.warnings,routes.polyline.encodedPolyline'

const PLACES = {
  home: process.env.COMMUTE_HOME || 'Kiebingen, 72108 Rottenburg am Neckar',
  work: process.env.COMMUTE_WORK || 'Max-Planck-Ring, 72076 Tübingen',
}
const LABELS = { home: 'Kiebingen', work: 'Max-Planck-Ring' }
// For Google Maps links, which anyone opening the page can see: never the exact addresses.
const PUBLIC_PLACES = { home: 'Kiebingen, 72108 Rottenburg am Neckar', work: 'Max-Planck-Ring, 72076 Tübingen' }

// Shown on every route because the campus roads at Max-Planck-Ring are private: not news.
const ALWAYS_WARNED = /privat|private/i

// Minutes from now.
const SLOTS = [0, 15, 30, 45, 60, 90]
const CACHE_MS = 5 * 60 * 1000
const DAILY_LIMIT = 500

const cache = new Map()
const usage = { day: '', calls: 0 }

const seconds = (s) => Number(String(s || '0').replace('s', ''))
const minutes = (s) => Math.round(seconds(s) / 60)

// Google's encoded polyline format, as [lat, lng] pairs.
function decodePolyline(encoded = '') {
  const points = []
  let i = 0
  let lat = 0
  let lng = 0
  const next = () => {
    let result = 0
    let shift = 0
    let byte
    do {
      byte = encoded.charCodeAt(i++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (i < encoded.length) {
    lat += next()
    lng += next()
    points.push([lat / 1e5, lng / 1e5])
  }
  return points
}

// The point of `path` furthest from `other`: a waypoint that makes Google Maps take that route.
function viaPoint(path, other) {
  const step = (list) => list.filter((_, i) => i % Math.max(1, Math.floor(list.length / 150)) === 0)
  const near = step(other)
  let best = null
  let bestDistance = -1
  for (const [lat, lng] of step(path)) {
    const distance = Math.min(...near.map(([a, b]) => (lat - a) ** 2 + ((lng - b) * Math.cos(lat * Math.PI / 180)) ** 2))
    if (distance > bestDistance) [best, bestDistance] = [{ lat, lng }, distance]
  }
  return best
}

async function routes(origin, destination, departAt) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: true,
      // Leaving now is the default; later slots ask for predicted traffic.
      ...(departAt ? { departureTime: departAt.toISOString() } : {}),
      languageCode: 'de-DE',
      regionCode: 'de',
      units: 'METRIC',
    }),
    signal: AbortSignal.timeout(10000),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = body.error?.message || `Routes API ${res.status}`
    // Enough to spot a mangled key in Vercel without showing it: Google keys are 39 characters starting AIza.
    const hint = /API key not valid/i.test(message) ? ` (the key set here is ${API_KEY.length} characters${API_KEY.startsWith('AIza') ? '' : ' and doesn’t start with AIza'})` : ''
    throw new Error(message + hint)
  }
  if (!body.routes?.length) throw new Error('No route found')
  return body.routes.map(r => ({
    route: r.description || '',
    minutes: minutes(r.duration),
    freeMinutes: minutes(r.staticDuration),
    km: Math.round((r.distanceMeters || 0) / 100) / 10,
    warnings: (r.warnings || []).filter(w => !ALWAYS_WARNED.test(w)),
    path: decodePolyline(r.polyline?.encodedPolyline),
  }))
}

// One slot: Google's suggested route, with the others as alternatives (quickest first).
async function slot(to, offset, now) {
  const from = to === 'work' ? 'home' : 'work'
  const departAt = new Date(now + offset * 60000)
  const [{ path, ...main }, ...others] = await routes(PLACES[from], PLACES[to], offset ? departAt : null)
  return {
    offset,
    departAt: departAt.toISOString(),
    ...main,
    alternatives: others.sort((a, b) => a.minutes - b.minutes)
      .map(({ route, minutes, km, path: own }) => ({ route, minutes, km, via: viaPoint(own, path) })),
  }
}

function spend(calls) {
  const day = new Date().toISOString().slice(0, 10)
  if (usage.day !== day) Object.assign(usage, { day, calls: 0 })
  if (usage.calls + calls > DAILY_LIMIT) return false
  usage.calls += calls
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const to = req.query.to === 'home' ? 'home' : 'work'
  const from = to === 'work' ? 'home' : 'work'
  const meta = { to, from: LABELS[from], destination: LABELS[to], origin: PUBLIC_PLACES[from], target: PUBLIC_PLACES[to] }

  if (req.query.demo) {
    return res.status(200).json({ ...meta, demo: true, fetchedAt: new Date().toISOString(), slots: demoSlots(to, SLOTS) })
  }
  if (!API_KEY) return res.status(503).json({ error: 'Traffic isn’t set up yet: add GOOGLE_ROUTES_API_KEY', code: 'unconfigured' })

  try {
    let hit = cache.get(to)
    if (!hit || hit.expires < Date.now()) {
      if (!spend(SLOTS.length)) return res.status(429).json({ error: 'That’s enough traffic look-ups for today' })
      const now = Date.now()
      const slots = await Promise.all(SLOTS.map(offset => slot(to, offset, now)))
      hit = { value: { ...meta, fetchedAt: new Date(now).toISOString(), slots }, expires: now + CACHE_MS }
      cache.set(to, hit)
    }
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_MS / 1000}, stale-while-revalidate=60`)
    return res.status(200).json(hit.value)
  } catch (err) {
    console.error('commute:', err.message)
    return res.status(502).json({ error: `Couldn’t get the traffic: ${err.message}` })
  }
}

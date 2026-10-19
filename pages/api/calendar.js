// Family calendar for the Stauperle 13 hallway kiosk.
//
// STAUPERLE_CALENDARS lists calendars as "Name|source", comma-separated. A source is either
//   - a Google Calendar ID (e.g. you@gmail.com), read via the Calendar API with a service
//     account the calendar is shared with (GOOGLE_SERVICE_ACCOUNT_KEY = key JSON, raw or base64), or
//   - an iCal URL, e.g. Google's "Secret address in iCal format".
//
//   STAUPERLE_CALENDARS="Family|you@gmail.com"
//
// An optional third part sets the calendar's colour ("Family|you@gmail.com|#039be5").
// Events coloured in Google Calendar keep their own colour (API calendars only). Google only
// returns event colours to writers, so share the calendar with the service account as
// "Make changes to events"; the readonly scope below still keeps this app read-only.
//   STAUPERLE_KEY="some-long-random-string"
//
// The events are private, so every request needs the kiosk key (x-kiosk-key header).
// The kiosk picks it up once from /stauperle13?key=... and remembers it.
import ical from 'node-ical'
import { JWT } from 'google-auth-library'

const CACHE_TTL = 5 * 60 * 1000
const API_CACHE_TTL = 60 * 1000
const MAX_DAYS = 31
// Matches the kiosk palette; assigned to calendars in the order they're configured.
const COLORS = ['#4fa3ff', '#ff7a90', '#3ddc97', '#ffb020', '#b18cff', '#4dd4e6']
// Google Calendar event colours by colorId. Google's own shades, with the darkest
// (Grape, Graphite, Blueberry, Basil, Tomato) lifted to stay legible on the dark kiosk,
// much like Google's dark theme does.
const GOOGLE_EVENT_COLORS = {
  1: '#7986cb', // Lavender
  2: '#33b679', // Sage
  3: '#a75bbf', // Grape
  4: '#e67c73', // Flamingo
  5: '#f6bf26', // Banana
  6: '#f4511e', // Tangerine
  7: '#039be5', // Peacock
  8: '#9e9e9e', // Graphite
  9: '#6f7fd8', // Blueberry
  10: '#5fa36f', // Basil
  11: '#e8453c', // Tomato
}

const calendars = () => (process.env.STAUPERLE_CALENDARS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map((entry, i) => {
    const [name, source, color] = entry.includes('|') ? entry.split('|') : [`Calendar ${i + 1}`, entry]
    return { name: name.trim(), source: source.trim(), color: color?.trim() || COLORS[i % COLORS.length] }
  })

const text = (v) => (typeof v === 'object' && v !== null ? v.val : v) || ''
const pad = (n) => String(n).padStart(2, '0')
// node-ical builds all-day dates at local midnight, so read them back with local getters.
const dateOnly = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const cache = new Map()

async function cached(key, ttl, fn) {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value
  const value = await fn()
  cache.set(key, { value, expires: Date.now() + ttl })
  return value
}

// iCal feeds

async function icalEvents(cal, from, to) {
  const data = await cached(cal.source, CACHE_TTL, async () => {
    const res = await fetch(cal.source, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`${cal.name}: HTTP ${res.status}`)
    return ical.sync.parseICS(await res.text())
  })

  const events = []
  for (const ev of Object.values(data)) {
    if (ev.type !== 'VEVENT') continue
    for (const inst of ical.expandRecurringEvent(ev, { from, to, expandOngoing: true })) {
      if (inst.event.status === 'CANCELLED') continue
      const end = inst.end || inst.start
      events.push({
        id: `${ev.uid}:${inst.start.toISOString()}`,
        title: text(inst.summary) || '(No title)',
        location: text(inst.event.location),
        allDay: inst.isFullDay,
        start: inst.isFullDay ? dateOnly(inst.start) : inst.start.toISOString(),
        end: inst.isFullDay ? dateOnly(end) : end.toISOString(),
      })
    }
  }
  return events
}

// Google Calendar API (service account)

let jwt = null

function serviceAccount() {
  if (jwt) return jwt
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '').trim()
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set')
  const creds = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'))
  jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  })
  return jwt
}

async function apiEvents(cal, from, to) {
  const items = await cached(`${cal.source}:${from.toDateString()}:${to.toDateString()}`, API_CACHE_TTL, async () => {
    const all = []
    let pageToken
    do {
      const { data } = await serviceAccount().request({
        url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.source)}/events`,
        params: {
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          singleEvents: true, // Google expands recurring events for us
          orderBy: 'startTime',
          maxResults: 250,
          pageToken,
        },
        timeout: 10000,
      }).catch(err => {
        const status = err.response?.status
        const hint = status === 404 ? ' (is the calendar shared with the service account?)' : ''
        throw new Error(`${cal.name}: ${err.response?.data?.error?.message || err.message}${hint}`)
      })
      all.push(...(data.items || []))
      pageToken = data.nextPageToken
    } while (pageToken)
    return all
  })

  return items
    .filter(ev => ev.status !== 'cancelled')
    .map(ev => ({
      id: ev.id,
      title: ev.summary || '(No title)',
      location: ev.location || '',
      allDay: Boolean(ev.start.date),
      start: ev.start.date || new Date(ev.start.dateTime).toISOString(),
      end: ev.end.date || new Date(ev.end.dateTime).toISOString(),
      color: GOOGLE_EVENT_COLORS[ev.colorId],
    }))
}

const isUrl = (source) => /^(https?|webcal):\/\//.test(source)

export default async function handler(req, res) {
  const key = process.env.STAUPERLE_KEY
  if (key ? req.headers['x-kiosk-key'] !== key : process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
  }

  const configured = calendars()
  if (!configured.length) {
    return res.status(503).json({ error: 'No calendars configured', code: 'unconfigured' })
  }

  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), MAX_DAYS)
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const results = await Promise.allSettled(configured.map(async cal => {
    const events = isUrl(cal.source)
      ? await icalEvents({ ...cal, source: cal.source.replace(/^webcal:/, 'https:') }, from, to)
      : await apiEvents(cal, from, to)
    return events.map(ev => ({ ...ev, calendar: cal.name, color: ev.color || cal.color }))
  }))

  const failed = results.filter(r => r.status === 'rejected').map(r => r.reason.message)
  if (failed.length === configured.length) {
    return res.status(502).json({ error: failed.join('; ') })
  }

  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).json({
    calendars: configured.map(({ name, color }) => ({ name, color })),
    events: results.flatMap(r => (r.status === 'fulfilled' ? r.value : [])),
    errors: failed,
  })
}

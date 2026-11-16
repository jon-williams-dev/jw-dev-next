// Advice for /commute: should I drive now, wait, or not bother? Works on the departure slots
// from /api/commute, each { offset (min from now), departAt, minutes, freeMinutes, km, route,
// alternatives: [{ route, minutes, km }] }, slot 0 being now.

export const ZONE = 'Europe/Berlin'

// Waiting has to save at least this much, and at least WAIT_SHARE of the time spent waiting.
const WAIT_SAVING = 6
const WAIT_SHARE = 0.25
// A slightly earlier departure that saves nearly as much beats the very best one.
const NEARLY = 2
// Up to this much over a free-flowing drive still counts as a clear road.
const CLEAR_DELAY = 3
// Leaving half an hour later costing this much more means hurry.
const GETTING_WORSE = 5
// This much over a free-flowing drive is a jam.
const JAM_DELAY = 15
// A different route has to be this much quicker to mention.
const ROUTE_SAVING = 3

const QUIPS = {
  go: [
    'Roads are empty. Floor it (within the speed limit).',
    'Clear run. You’ll be there before the coffee’s cold.',
    'Green lights all the way. Probably.',
    'Even the B28 is behaving.',
  ],
  hurry: [
    'Shoes on. Keys. Go.',
    'Everyone else is about to have the same idea.',
    'Skip the second coffee.',
  ],
  wait: [
    'Have another coffee.',
    'Finish your toast.',
    'Five more minutes of email. Or fifteen.',
    'Let the others queue for you.',
  ],
  goanyway: [
    'Podcast time.',
    'Bring patience. And snacks.',
    'It is what it is.',
  ],
  noway: [
    'Work from home?',
    'The bike looks lovely today.',
    'Perfect day for a very long breakfast.',
  ],
}

export const clock = (date) => new Date(date).toLocaleTimeString('de-DE', { timeZone: ZONE, hour: '2-digit', minute: '2-digit' })

// Hour and weekday (0 = Sunday) in German time, wherever this runs.
export function berlinNow(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: 'numeric', hourCycle: 'h23', weekday: 'short' })
    .formatToParts(now).map(p => [p.type, p.value]))
  return { hour: Number(parts.hour), weekend: parts.weekday === 'Sat' || parts.weekday === 'Sun' }
}

// Mornings go to work, afternoons go home.
export const defaultDirection = (now = new Date()) => berlinNow(now).hour < 12 ? 'work' : 'home'

// `seed` picks the joke (e.g. the minute), so it doesn't change on every render.
export function advise(slots, { seed = 0, to = 'work', now = new Date() } = {}) {
  const current = slots[0]
  const saved = (s) => current.minutes - s.minutes
  const worthWaiting = slots.filter(s => s.offset > 0 && saved(s) >= WAIT_SAVING && saved(s) >= s.offset * WAIT_SHARE)
  const most = Math.max(0, ...worthWaiting.map(saved))
  const wait = worthWaiting.find(s => saved(s) >= most - NEARLY)
  const best = wait || current
  const later = slots.find(s => s.offset === 30)
  const delay = current.minutes - current.freeMinutes
  const worse = later ? later.minutes - current.minutes : 0
  const arrive = (s) => clock(Date.parse(s.departAt) + s.minutes * 60000)

  let kind
  let answer
  let detail
  if (wait) {
    kind = 'wait'
    answer = 'Not yet.'
    detail = `Leave at ${clock(wait.departAt)}: ${wait.minutes} min instead of ${current.minutes}, there by ${arrive(wait)}.`
  } else if (delay <= CLEAR_DELAY) {
    kind = 'go'
    answer = 'Yes. Go.'
    detail = `${current.minutes} min, about as good as it gets.`
  } else if (worse >= GETTING_WORSE) {
    kind = 'hurry'
    answer = 'Go. Now.'
    detail = `It’s ${current.minutes} min now, and ${later.minutes} min if you leave in half an hour.`
  } else if (delay >= JAM_DELAY) {
    kind = 'noway'
    answer = 'No way.'
    detail = `…unless you enjoy brake lights: ${current.minutes} min, ${delay} more than usual, and waiting won’t fix it.`
  } else {
    kind = 'goanyway'
    answer = 'Go anyway.'
    detail = `It’s busy (+${delay} min), and waiting won’t save much.`
  }

  const quips = QUIPS[kind]
  const quip = to === 'work' && berlinNow(now).weekend ? 'It’s the weekend. Are you sure?' : quips[seed % quips.length]

  const faster = current.alternatives.find(a => current.minutes - a.minutes >= ROUTE_SAVING)
  const routeTip = faster && {
    text: `Take ${faster.route || 'the other route'}: ${current.minutes - faster.minutes} min quicker than ${current.route || 'the usual'}.`,
    via: faster.via,
  }

  return { kind, answer, detail, quip, routeTip, delay, best }
}

// Google Maps directions, through `via` (a { lat, lng } on the route) to make it take that road.
export function mapsLink(origin, destination, via) {
  const params = new URLSearchParams({ api: '1', origin, destination, travelmode: 'driving' })
  if (via) params.set('waypoints', `${via.lat.toFixed(5)},${via.lng.toFixed(5)}`)
  return `https://www.google.com/maps/dir/?${params}`
}

// ?demo=1: believable rush hours (07:30 and 16:45) so the page can be tried without an API key.
export function demoSlots(to, offsets, now = Date.now()) {
  const free = 17
  const rush = (t) => {
    const date = new Date(t)
    const hour = Number(date.toLocaleString('en-GB', { timeZone: ZONE, hour: 'numeric', hourCycle: 'h23' }))
      + date.getUTCMinutes() / 60
    const peak = (centre, width, height) => height * Math.exp(-(((hour - centre) / width) ** 2))
    return to === 'work' ? peak(7.5, 0.7, 16) + peak(16.75, 1, 4) : peak(16.75, 0.8, 18) + peak(7.5, 0.7, 4)
  }
  return offsets.map(offset => {
    const departAt = new Date(now + offset * 60000)
    const minutes = Math.round(free + rush(departAt))
    return {
      offset,
      departAt: departAt.toISOString(),
      minutes,
      freeMinutes: free,
      km: 13.4,
      route: 'B28',
      alternatives: [{ route: 'L370 über Hirschau', minutes: Math.round(20 + rush(departAt) * 0.5), km: 15.1, via: { lat: 48.4985, lng: 9.0175 } }],
      warnings: [],
    }
  })
}

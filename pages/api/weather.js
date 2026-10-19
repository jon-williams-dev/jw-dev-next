// Weather for the Stauperle 13 hallway kiosk, via Open-Meteo (free, no key).
// Proxied server-side so the kiosk only ever talks to our own origin: no CORS,
// ad-blocker or DNS-filter surprises, and one cached upstream call for all screens.

// Kiebingen, 72108 Rottenburg am Neckar
const LAT = 48.4753
const LNG = 8.9714
const CACHE_TTL = 10 * 60 * 1000
const API = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
  latitude: LAT,
  longitude: LNG,
  current: 'temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m',
  hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  timezone: 'Europe/Berlin',
  forecast_days: 4,
})

let cache = null

export default async function handler(req, res) {
  try {
    if (!cache || cache.expires < Date.now()) {
      const upstream = await fetch(API, { signal: AbortSignal.timeout(10000) })
      if (!upstream.ok) throw new Error(`Open-Meteo responded ${upstream.status}`)
      cache = { value: await upstream.json(), expires: Date.now() + CACHE_TTL }
    }
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800')
    res.status(200).json(cache.value)
  } catch (err) {
    // A stale forecast beats none.
    if (cache) return res.status(200).json(cache.value)
    res.status(502).json({ error: err.message })
  }
}

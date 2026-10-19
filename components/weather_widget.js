import { useEffect, useState } from 'react'
import styles from '../styles/stauperle.module.scss'

// Open-Meteo forecast for Kiebingen, proxied through our own API (location lives there).
const API = '/api/weather'
const REFRESH_MS = 15 * 60 * 1000
const RETRY_MS = 60 * 1000

// WMO weather codes → label + icon kind.
const CONDITIONS = [
  [[0], 'Clear', 'clear'],
  [[1], 'Mostly clear', 'partly'],
  [[2], 'Partly cloudy', 'partly'],
  [[3], 'Overcast', 'cloud'],
  [[45, 48], 'Fog', 'fog'],
  [[51, 53, 55, 56, 57], 'Drizzle', 'drizzle'],
  [[61, 63, 80, 81], 'Rain', 'rain'],
  [[65, 82], 'Heavy rain', 'rain'],
  [[66, 67], 'Freezing rain', 'rain'],
  [[71, 73, 75, 77, 85, 86], 'Snow', 'snow'],
  [[95, 96, 99], 'Thunderstorm', 'storm'],
]
const condition = (code) => {
  const match = CONDITIONS.find(([codes]) => codes.includes(code))
  return match ? { label: match[1], kind: match[2] } : { label: '–', kind: 'cloud' }
}

const SUN = '#ffb020'
const MOON = '#c9d6ff'
const CLOUD = '#b8c4d2'
const RAIN = '#4fa3ff'
const SNOW = '#ffffff'
const BOLT = '#ffd84a'

function WeatherIcon({ code, day = true, className }) {
  const { kind } = condition(code)
  const sky = day
    ? <g stroke={SUN}><circle cx="9" cy="9" r="3.5" /><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4 4l1 1M13 13l1 1M4 14l1-1M13 5l1-1" /></g>
    : <path stroke={MOON} d="M12.5 3.5a6 6 0 1 0 2 8.5 5 5 0 0 1-2-8.5z" />
  const cloud = (y = 0) => (
    <path stroke={CLOUD} fill="#1a2532" transform={`translate(0 ${y})`}
      d="M7 19h10.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6-1A4 4 0 0 0 7 19z" />
  )

  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {kind === 'clear' && (day
        ? <g stroke={SUN}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g>
        : <path stroke={MOON} d="M16 4a8 8 0 1 0 4 12 7 7 0 0 1-4-12z" />)}
      {kind === 'partly' && <>{sky}{cloud(1)}</>}
      {kind === 'cloud' && cloud(-2)}
      {kind === 'fog' && <path stroke={CLOUD} d="M3 8h18M5 12h14M3 16h18M7 20h10" />}
      {kind === 'drizzle' && <>{cloud(-4)}<path stroke={RAIN} d="M9 19v1M13 19v1M17 19v1" /></>}
      {kind === 'rain' && <>{cloud(-4)}<path stroke={RAIN} d="M8.5 18l-1 3M12.5 18l-1 3M16.5 18l-1 3" /></>}
      {kind === 'snow' && <>{cloud(-4)}<g fill={SNOW} stroke="none"><circle cx="9" cy="19.5" r="1" /><circle cx="13" cy="21" r="1" /><circle cx="17" cy="19.5" r="1" /></g></>}
      {kind === 'storm' && <>{cloud(-4)}<path stroke={BOLT} d="M13 16l-2.5 3.5h3L11 23" /></>}
    </svg>
  )
}

const deg = (t) => `${Math.round(t)}°`
const hourLabel = (iso) => iso.slice(11, 16)
const dayLabel = (iso) => new Date(`${iso}T12:00`).toLocaleDateString('de-DE', { weekday: 'short' })

export default function WeatherWidget() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer
    const load = async () => {
      let ok = false
      try {
        const res = await fetch(API)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
        if (!cancelled) { setData(json); setError(null) }
        ok = true
      } catch (err) {
        // Keep showing the last good forecast if the wifi drops.
        if (!cancelled) setError(err.message || 'Network error')
      }
      // Retry failures quickly so a kiosk that boots before the wifi recovers on its own.
      if (!cancelled) timer = setTimeout(load, ok ? REFRESH_MS : RETRY_MS)
    }
    load()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  if (!data) {
    return (
      <section className={`${styles.weather} ${styles.weatherEmpty}`}>
        {error ? (
          <>
            <span>Weather unavailable</span>
            <small className={styles.weatherError}>{error} · retrying</small>
          </>
        ) : 'Loading weather…'}
      </section>
    )
  }

  const { current, hourly, daily } = data
  const now = condition(current.weather_code)
  const start = hourly.time.findIndex(t => t >= current.time.slice(0, 13))
  const hours = hourly.time.slice(start + 1, start + 6).map((t, i) => ({
    time: t,
    temp: hourly.temperature_2m[start + 1 + i],
    code: hourly.weather_code[start + 1 + i],
    day: hourly.is_day[start + 1 + i] === 1,
    rain: hourly.precipitation_probability[start + 1 + i],
  }))
  const days = daily.time.slice(1, 4).map((t, i) => ({
    time: t,
    code: daily.weather_code[i + 1],
    max: daily.temperature_2m_max[i + 1],
    min: daily.temperature_2m_min[i + 1],
    rain: daily.precipitation_probability_max[i + 1],
  }))

  return (
    <section className={styles.weather}>
      <div className={styles.weatherNow}>
        <WeatherIcon code={current.weather_code} day={current.is_day === 1} className={styles.weatherNowIcon} />
        <div>
          <div className={styles.weatherTemp}>{deg(current.temperature_2m)}</div>
          <div className={styles.weatherLabel}>{now.label}</div>
        </div>
        <div className={styles.weatherMeta}>
          <span>Kiebingen{error && ' · offline'}</span>
          <span>↑ {deg(daily.temperature_2m_max[0])}  ↓ {deg(daily.temperature_2m_min[0])}</span>
          <span>Feels {deg(current.apparent_temperature)} · {Math.round(current.wind_speed_10m)} km/h</span>
        </div>
      </div>

      <div className={styles.weatherHours}>
        {hours.map(h => (
          <div key={h.time} className={styles.weatherSlot}>
            <span className={styles.weatherSlotLabel}>{hourLabel(h.time)}</span>
            <WeatherIcon code={h.code} day={h.day} className={styles.weatherSlotIcon} />
            <span className={styles.weatherSlotTemp}>{deg(h.temp)}</span>
            <span className={styles.weatherRain}>{h.rain >= 20 ? `${h.rain}%` : ' '}</span>
          </div>
        ))}
      </div>

      <div className={styles.weatherDays}>
        {days.map(d => (
          <div key={d.time} className={styles.weatherDay}>
            <span className={styles.weatherDayLabel}>{dayLabel(d.time)}</span>
            <WeatherIcon code={d.code} className={styles.weatherDayIcon} />
            <span className={styles.weatherDayTemps}>{deg(d.max)} <em>{deg(d.min)}</em></span>
            <span className={styles.weatherRain}>{d.rain >= 20 ? `${d.rain}%` : ''}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

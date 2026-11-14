import { useEffect, useState } from 'react'
import { BIN_TYPES, binsOn, planEnds } from '../lib/stauperle_bins'
import { TIMETABLES, WEEKDAYS, focusDay, kitFor } from '../lib/stauperle_timetables'
import styles from '../styles/stauperle.module.scss'

// Reminders strip on the kiosk home screen: bins to put out, what the weather calls for and
// what each child needs for school and clubs, for the same day the School tile shows.
// Bin days are in lib/stauperle_bins.js.
const REFRESH_MS = 15 * 60 * 1000
const DAY_HOURS = [7, 18] // the part of the day the weather advice looks at
const RAIN_CHANCE = 50 // % chance of rain worth a jacket
const COLD = 5 // °C
const FREEZING = 0
const HOT = 26

const pad = (n) => String(n).padStart(2, '0')
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// The date of the next WEEKDAYS[index] from today (today itself counts), i.e. focusDay's date.
function dateFor(index, now) {
  const offset = (index - (now.getDay() + 6) % 7 + 7) % 7
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
}

function weatherAdvice(weather, date, isToday, now) {
  const day = isoDate(date)
  const hours = (weather?.hourly?.time || []).map((time, i) => ({
    time,
    hour: +time.slice(11, 13),
    rain: weather.hourly.precipitation_probability[i] ?? 0,
    temp: weather.hourly.temperature_2m[i],
  })).filter(h => h.time.startsWith(day) && h.hour >= DAY_HOURS[0] && h.hour <= DAY_HOURS[1] && (!isToday || h.hour >= now.getHours()))
  if (!hours.length) return []

  const advice = []
  const wet = hours.find(h => h.rain >= RAIN_CHANCE)
  if (wet) advice.push({ icon: '☔', text: `Rain jacket · ${Math.max(...hours.map(h => h.rain))}% from ${pad(wet.hour)}:00` })
  const low = Math.min(...hours.map(h => h.temp))
  const high = Math.max(...hours.map(h => h.temp))
  if (low <= FREEZING) advice.push({ icon: '🧤', text: `Hat & gloves · ${Math.round(low)}°` })
  else if (low <= COLD) advice.push({ icon: '🧥', text: `Warm coat · ${Math.round(low)}°` })
  if (high >= HOT) advice.push({ icon: '🧴', text: `Sun cream & water · ${Math.round(high)}°` })
  return advice
}

// Tonight's bins go out for tomorrow's collection; today's are only worth a mention in the morning.
function binReminders(now) {
  const today = isoDate(now)
  const tomorrow = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const reminder = (label, types) => ({
    text: `${label} ${types.map(type => BIN_TYPES[type].name).join(' & ')}`,
    colors: types.map(type => BIN_TYPES[type].color),
  })
  const reminders = []
  if (now.getHours() < 12 && binsOn(today).length) reminders.push(reminder('Today:', binsOn(today)))
  if (binsOn(tomorrow).length) reminders.push(reminder('Tonight: put out', binsOn(tomorrow)))
  if (today > planEnds()) reminders.push({ icon: '🗑️', text: 'Add this year’s bin plan' })
  return reminders
}

export default function TakeToday() {
  const [now, setNow] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const load = async () => {
      setNow(new Date())
      // Without the forecast the strip still shows bins and kit.
      const res = await fetch('/api/weather').catch(() => null)
      if (res?.ok) setWeather(await res.json())
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  const { index, isToday, isTomorrow } = focusDay(now)
  const day = WEEKDAYS[index]
  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : day.long
  const items = [
    ...binReminders(now),
    ...weatherAdvice(weather, dateFor(index, now), isToday, now),
    ...TIMETABLES.map(child => ({ child, kit: kitFor(child, day.key) }))
      .filter(({ kit }) => kit.length)
      .map(({ child, kit }) => ({ icon: '🎒', text: `${child.name}: ${kit.join(', ')}` })),
  ]
  if (!items.length) return null

  return (
    <section className={styles.takeToday}>
      <span className={styles.takeTodayLabel}>{label}</span>
      {items.map(({ icon, colors, text }) => (
        <span key={text} className={styles.takeTodayItem}>
          {colors
            ? colors.map(color => <span key={color} className={styles.binDot} style={{ background: color }} aria-hidden="true" />)
            : <span aria-hidden="true">{icon}</span>}
          {' '}{text}
        </span>
      ))}
    </section>
  )
}

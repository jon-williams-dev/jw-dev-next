import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import KioskLayout, { kioskFetch, kioskKey, setKioskKey } from '../../components/kiosk_layout'
import styles from '../../styles/stauperle.module.scss'

const DAYS = 14
const REFRESH_MS = 5 * 60 * 1000
const RETRY_MS = 60 * 1000

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
// All-day events arrive as YYYY-MM-DD (end exclusive); timed ones as ISO instants.
const parse = (ev) => {
  if (!ev.allDay) return { ...ev, from: new Date(ev.start), to: new Date(ev.end) }
  const [y1, m1, d1] = ev.start.split('-').map(Number)
  const [y2, m2, d2] = ev.end.split('-').map(Number)
  const to = new Date(y2, m2 - 1, d2)
  const from = new Date(y1, m1 - 1, d1)
  return { ...ev, from, to: to > from ? to : addDays(from, 1) }
}

const time = (d) => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
const dayName = (d, i) => i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
  : d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' })

// Sample data for ?demo=1 so the page can be tried without calendars or a key.
// Built in the browser so times are local to the viewer.
function demoData() {
  const cals = [
    { name: 'Family', color: '#4fa3ff' },
    { name: 'Kids', color: '#ff7a90' },
    { name: 'Jon', color: '#3ddc97' },
  ]
  const at = (offset, h, m) => {
    const d = addDays(startOfDay(new Date()), offset)
    d.setHours(h, m)
    return d.toISOString()
  }
  const ymd = (offset) => addDays(startOfDay(new Date()), offset).toLocaleDateString('en-CA')
  const timed = (title, offset, h1, m1, h2, m2, location = '') =>
    ({ title, location, allDay: false, start: at(offset, h1, m1), end: at(offset, h2, m2) })
  const allDay = (title, offset, length = 1) =>
    ({ title, location: '', allDay: true, start: ymd(offset), end: ymd(offset + length) })
  const events = [
    [1, timed('School', 0, 7, 30, 13, 0)],
    [0, timed('Swimming', 0, 9, 0, 10, 0, 'Hallenbad Rottenburg')],
    [2, timed('Dentist', 0, 14, 0, 14, 45)],
    [1, timed('Piano lesson', 0, 16, 0, 17, 0, 'Musikschule Rottenburg')],
    [0, timed('Football training', 0, 18, 0, 19, 30, 'Sportplatz Kiebingen')],
    [0, allDay('Oma visiting', 1, 2)],
    [1, timed('Birthday party – Lena', 1, 14, 30, 16, 0)],
    [2, timed('Recycling bin out', 2, 19, 0, 19, 15)],
    [0, timed('Swimming', 3, 9, 0, 10, 0, 'Hallenbad Rottenburg')],
    [1, timed('Parents’ evening', 4, 19, 30, 21, 0, 'Grundschule Kiebingen')],
    [0, allDay('School holidays', 7, 5)],
    [2, timed('MOT – Ducati', 8, 8, 0, 9, 0)],
    [0, timed('Dinner with friends', 10, 19, 0, 22, 0)],
  ]
  return {
    calendars: cals,
    events: events.map(([c, ev], i) => ({ id: `demo-${i}`, ...ev, calendar: cals[c].name, color: cals[c].color })),
    errors: [],
  }
}

function timeLabel(ev, dayStart, dayEnd) {
  if (ev.allDay || (ev.from <= dayStart && ev.to >= dayEnd)) return 'All day'
  if (ev.from < dayStart) return `until ${time(ev.to)}`
  if (ev.to > dayEnd) return `from ${time(ev.from)}`
  return `${time(ev.from)} – ${time(ev.to)}`
}

function buildDays(events, now) {
  const today = startOfDay(now)
  return Array.from({ length: DAYS }, (_, i) => {
    const start = addDays(today, i)
    const end = addDays(today, i + 1)
    const items = events
      .filter(ev => ev.from < end && ev.to > start)
      .sort((a, b) => (b.allDay - a.allDay) || (a.from - b.from) || a.title.localeCompare(b.title))
      .map(ev => ({
        ...ev,
        label: timeLabel(ev, start, end),
        past: !ev.allDay && ev.to <= now,
        now: !ev.allDay && ev.from <= now && ev.to > now,
      }))
    return { date: start, name: dayName(start, i), items }
  })
}

function Event({ ev, large }) {
  return (
    <li
      className={`${styles.event} ${large ? styles.eventLarge : ''} ${ev.past ? styles.eventPast : ''}`}
      style={{ '--cal': ev.color }}
    >
      <span className={styles.eventTime}>
        {ev.now ? <strong>Now</strong> : ev.label}
      </span>
      <span className={styles.eventTitle}>{ev.title}</span>
      {ev.location && <span className={styles.eventLocation}>{ev.location}</span>}
    </li>
  )
}

const MESSAGES = {
  unpaired: ['Enter the family key', 'This device needs the key once to show the calendar. It’s remembered afterwards.'],
  unconfigured: ['No calendars set up', 'Add Google Calendar iCal links to STAUPERLE_CALENDARS.'],
}

function PairForm({ onPaired }) {
  const [value, setValue] = useState('')
  const rejected = Boolean(kioskKey())

  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setKioskKey(value)
    onPaired()
  }

  return (
    <form className={styles.pair} onSubmit={submit}>
      <input
        type="password"
        autoComplete="current-password"
        placeholder={rejected ? 'Key not accepted, try again' : 'Key'}
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
      />
      <button type="submit">Unlock</button>
    </form>
  )
}

export default function FamilyCalendar() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const [attempt, setAttempt] = useState(0)
  const router = useRouter()
  const demo = router.query.demo === '1'

  useEffect(() => {
    if (!router.isReady) return
    if (demo) { setData(demoData()); setError(null); return }
    setData(null)
    let cancelled = false
    let timer
    const load = async () => {
      let ok = false
      try {
        const res = await kioskFetch(`/api/calendar?days=${DAYS}`)
        const json = await res.json()
        if (!res.ok) throw Object.assign(new Error(json.error || `HTTP ${res.status}`), { code: json.code })
        if (!cancelled) { setData(json); setError(null) }
        ok = true
      } catch (err) {
        if (!cancelled) setError({ message: err.message || 'Network error', code: err.code })
      }
      if (!cancelled) timer = setTimeout(load, ok ? REFRESH_MS : RETRY_MS)
    }
    load()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [attempt, demo, router.isReady])

  // Re-render every minute so "Now", faded past events and midnight rollover stay current.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const days = useMemo(() => data && buildDays(data.events.map(parse), now), [data, now])

  if (!days) {
    const [title, hint] = MESSAGES[error?.code] || (error
      ? ['Calendar unavailable', `${error.message} · retrying`]
      : ['Loading calendar…', ''])
    return (
      <KioskLayout title="Family Calendar">
        <section className={`${styles.placeholder} ${styles.calendar}`}>
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
          {error?.code === 'unpaired' && <PairForm onPaired={() => setAttempt(a => a + 1)} />}
          {error?.code in MESSAGES && (
            <Link href="/stauperle13/calendar?demo=1" className={styles.demoLink}>Preview with sample events</Link>
          )}
        </section>
      </KioskLayout>
    )
  }

  const [today, ...upcoming] = days
  const busy = upcoming.filter(d => d.items.length)

  return (
    <KioskLayout title={demo ? 'Family Calendar (demo)' : 'Family Calendar'}>
      <div className={styles.agenda}>
        <section className={styles.agendaToday}>
          <h2 className={styles.agendaHeading}>
            Today
            <span>{today.date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </h2>
          {today.items.length ? (
            <ul className={styles.eventList}>
              {today.items.map(ev => <Event key={ev.id} ev={ev} large />)}
            </ul>
          ) : (
            <p className={styles.agendaEmpty}>Nothing planned today</p>
          )}
          {data.calendars.length > 1 && (
            <div className={styles.legend}>
              {data.calendars.map(c => (
                <span key={c.name} style={{ '--cal': c.color }}>{c.name}</span>
              ))}
            </div>
          )}
        </section>

        <section className={styles.agendaUpcoming}>
          {busy.length ? busy.map(day => (
            <div key={day.date.toISOString()} className={styles.agendaDay}>
              <h3>{day.name}</h3>
              <ul className={styles.eventList}>
                {day.items.map(ev => <Event key={ev.id} ev={ev} />)}
              </ul>
            </div>
          )) : (
            <p className={styles.agendaEmpty}>Nothing planned in the next two weeks</p>
          )}
          {data.errors?.length > 0 && <p className={styles.agendaWarning}>Couldn’t load: {data.errors.join('; ')}</p>}
        </section>
      </div>
    </KioskLayout>
  )
}

import Link from 'next/link'
import { useEffect, useState } from 'react'
import KioskLayout, { kioskFetch } from '../../components/kiosk_layout'
import WeatherWidget from '../../components/weather_widget'
import { CalendarIcon, SchoolIcon, SunbankIcon, VacuumIcon } from '../../components/kiosk_icons'
import { schoolSummary } from '../../lib/stauperle_timetables'
import styles from '../../styles/stauperle.module.scss'

const VACUUM_RESET_MS = 10 * 1000

// Starts the Roborock. The tile's subtitle shows how it went, then goes back to the hint.
function VacuumTile() {
  const [state, setState] = useState({ busy: false, message: 'Tap to start cleaning' })

  const start = async () => {
    if (state.busy) return
    setState({ busy: true, message: 'Starting…' })
    let message
    try {
      const res = await kioskFetch('/api/roborock', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      message = res.ok ? 'Cleaning started' : res.status === 401 ? 'Unlock the calendar first' : data.error || 'Could not start'
    } catch {
      message = 'Could not start'
    }
    setState({ busy: false, message })
    setTimeout(() => setState((s) => (s.busy ? s : { busy: false, message: 'Tap to start cleaning' })), VACUUM_RESET_MS)
  }

  return (
    <button type="button" className={`${styles.tile} ${styles.vacuum}`} onClick={start} disabled={state.busy}>
      <VacuumIcon className={styles.tileIcon} />
      <span className={styles.tileTitle}>Hoover</span>
      <span className={styles.tileSub}>{state.message}</span>
    </button>
  )
}

export default function Stauperle13() {
  // Client-only so the time-dependent summary never mismatches the server render.
  const [school, setSchool] = useState('Timetables')

  useEffect(() => {
    const update = () => setSchool(schoolSummary(new Date()))
    update()
    const id = setInterval(update, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const tiles = [
    { href: '/stauperle13/calendar', title: 'Family Calendar', sub: 'What’s on today & this week', Icon: CalendarIcon, accent: styles.calendar },
    { href: '/stauperle13/school', title: 'School', sub: school, Icon: SchoolIcon, accent: styles.school },
    { href: '/stauperle13/sunbank', title: 'Sunbank', sub: 'Solar & battery', Icon: SunbankIcon, accent: styles.sun },
  ]

  return (
    <KioskLayout home>
      <div className={styles.home}>
        <WeatherWidget />
        <nav className={styles.tiles}>
          {tiles.map(({ href, title, sub, Icon, accent }) => (
            <Link key={href} href={href} className={`${styles.tile} ${accent}`}>
              <Icon className={styles.tileIcon} />
              <span className={styles.tileTitle}>{title}</span>
              <span className={styles.tileSub}>{sub}</span>
            </Link>
          ))}
          <VacuumTile />
        </nav>
      </div>
    </KioskLayout>
  )
}

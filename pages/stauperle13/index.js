import Link from 'next/link'
import { useEffect, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import WeatherWidget from '../../components/weather_widget'
import { CalendarIcon, SchoolIcon, SunbankIcon } from '../../components/kiosk_icons'
import { schoolSummary } from '../../lib/stauperle_timetables'
import styles from '../../styles/stauperle.module.scss'

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
        </nav>
      </div>
    </KioskLayout>
  )
}

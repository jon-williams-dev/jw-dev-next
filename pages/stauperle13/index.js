import Link from 'next/link'
import KioskLayout from '../../components/kiosk_layout'
import WeatherWidget from '../../components/weather_widget'
import { CalendarIcon, SunbankIcon } from '../../components/kiosk_icons'
import styles from '../../styles/stauperle.module.scss'

const TILES = [
  { href: '/stauperle13/calendar', title: 'Family Calendar', sub: 'What’s on today & this week', Icon: CalendarIcon, accent: styles.calendar },
  { href: '/stauperle13/sunbank', title: 'Sunbank', sub: 'Solar & battery', Icon: SunbankIcon, accent: styles.sun },
]

export default function Stauperle13() {
  return (
    <KioskLayout home>
      <div className={styles.home}>
        <WeatherWidget />
        <nav className={styles.tiles}>
          {TILES.map(({ href, title, sub, Icon, accent }) => (
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

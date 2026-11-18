import { useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import KioskOverlay from '../../components/kiosk_overlay'
import { BeerIcon, CarIcon, ChevronIcon, CrispsIcon, MotorbikeIcon } from '../../components/kiosk_icons'
import styles from '../../styles/stauperle.module.scss'

// The site's fun questions, each opening over the kiosk with a Close button.
const QUESTIONS = [
  { src: '/commute', title: 'Should I drive now?', sub: 'Live traffic to work and home', Icon: CarIcon, color: '#3ddc97' },
  { src: '/should/beer', title: 'Is it beer o’clock?', sub: 'Counting down to 12:00', Icon: BeerIcon, color: '#ffb020' },
  { src: '/should/motorbike', title: 'Should I buy a new motorbike?', sub: 'Try saying no', Icon: MotorbikeIcon, color: '#ff7ab6' },
  { src: '/should/crisps', title: 'Should I eat some crisps?', sub: 'You’ll have to really want them', Icon: CrispsIcon, color: '#7ab8ff' },
]

export default function Should() {
  const [open, setOpen] = useState(null)

  return (
    <KioskLayout title="Should I…?">
      {open && <KioskOverlay title={open.title} src={open.src} onClose={() => setOpen(null)} />}
      <ul className={styles.shouldList}>
        {QUESTIONS.map(q => (
          <li key={q.src}>
            <button type="button" className={styles.shouldItem} style={{ '--accent': q.color }} onClick={() => setOpen(q)}>
              <q.Icon className={styles.shouldIcon} />
              <span className={styles.shouldText}>
                <strong>{q.title}</strong>
                <span>{q.sub}</span>
              </span>
              <ChevronIcon className={styles.shouldChevron} />
            </button>
          </li>
        ))}
      </ul>
    </KioskLayout>
  )
}

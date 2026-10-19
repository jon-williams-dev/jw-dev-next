import KioskLayout from '../../components/kiosk_layout'
import { SunbankIcon } from '../../components/kiosk_icons'
import styles from '../../styles/stauperle.module.scss'

export default function Sunbank() {
  return (
    <KioskLayout title="Sunbank">
      <section className={`${styles.placeholder} ${styles.sun}`}>
        <SunbankIcon />
        <h2>Sunbank</h2>
        <p>Coming soon: live solar generation, battery charge and house usage.</p>
      </section>
    </KioskLayout>
  )
}

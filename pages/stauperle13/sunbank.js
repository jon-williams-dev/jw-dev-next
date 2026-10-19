import KioskLayout from '../../components/kiosk_layout'
import { SunbankIcon } from '../../components/kiosk_icons'
import {
    LIVE_MS, IDLE_W, fmtPower, splitPower, fmtKwh, batteryEta, summary, useVartaStatus, useNow, Freshness, PowerFlow,
} from '../../components/energy_flow'
import styles from '../../styles/stauperle.module.scss'

// Live overview of the VARTA battery and grid, read on the home network (same API as /varta).
export default function Sunbank() {
    const { data, lastSuccess, error, unavailable } = useVartaStatus()
    const now = useNow()

    if (unavailable || !data) {
        return (
            <KioskLayout title="Sunbank">
                <section className={`${styles.placeholder} ${styles.sun}`}>
                    <SunbankIcon />
                    <h2>Sunbank</h2>
                    <p>
                        {unavailable
                            ? 'Live battery data is only available on the home network.'
                            : error ? `Can’t reach the battery – ${error}. Retrying…` : 'Connecting to the battery…'}
                    </p>
                </section>
            </KioskLayout>
        )
    }

    const { battery, grid } = data
    const stale = !lastSuccess || now - lastSuccess >= LIVE_MS || !!error
    const headline = summary(battery, grid)
    const eta = batteryEta(battery)
    const state = battery.power > IDLE_W ? 'Charging' : battery.power < -IDLE_W ? 'Discharging' : 'Idle'
    const bp = splitPower(battery.power)
    const gp = splitPower(grid.direction === 'idle' ? 0 : grid.power)

    return (
        <KioskLayout title="Sunbank">
            <div className={`${styles.sunbank} ${stale ? styles.sunStale : ''}`}>
                <section className={styles.sunFlow}>
                    <div className={styles.sunFlowHead}>
                        <p className={`${styles.sunHeadline} ${styles[`tone_${headline.tone}`] || ''}`}>{headline.text}</p>
                        <Freshness lastSuccess={lastSuccess} error={error} now={now} />
                    </div>
                    <PowerFlow battery={battery} grid={grid} />
                </section>

                <div className={styles.sunSide}>
                    <section className={styles.sunPanel}>
                        <div className={styles.sunPanelHead}>
                            <span>Battery</span>
                            <span className={styles.sunChip}>{state}</span>
                        </div>
                        <div className={styles.sunBig}>{battery.charge}<small>%</small></div>
                        <div className={styles.sunBar} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={battery.charge} aria-label="Battery charge">
                            <div style={{ width: `${battery.charge}%` }} />
                        </div>
                        <div className={styles.sunFacts}>
                            <span><b>{fmtKwh(battery.capacityWh * battery.charge / 100)}</b> stored</span>
                            <span>
                                {state === 'Idle' ? 'Idle' : <><b>{bp.value} {bp.unit}</b> {state.toLowerCase()}</>}
                            </span>
                            {eta && <span>{eta.label === 'Full in' ? 'Full' : 'Lasts until'} <b>~{eta.at}</b></span>}
                        </div>
                    </section>

                    <section className={`${styles.sunPanel} ${styles[`grid_${grid.direction}`]}`}>
                        <div className={styles.sunPanelHead}>
                            <span>Grid</span>
                            <span className={styles.sunChip}>{grid.direction === 'import' ? 'Importing' : grid.direction === 'export' ? 'Exporting' : 'Balanced'}</span>
                        </div>
                        <div className={styles.sunBig}>{gp.value}<small>{gp.unit}</small></div>
                        <div className={styles.sunFacts}>
                            <span>{grid.direction === 'import' ? 'Buying electricity' : grid.direction === 'export' ? 'Selling surplus' : 'Not buying or selling'}</span>
                        </div>
                    </section>
                </div>
            </div>
        </KioskLayout>
    )
}

import { useEffect, useState } from 'react'
import KioskLayout, { PairForm, KIOSK_ACTIVITY } from '../../components/kiosk_layout'
import { CloseIcon, SunbankIcon } from '../../components/kiosk_icons'
import {
    LIVE_MS, IDLE_W, fmtPower, splitPower, fmtKwh, batteryEta, summary, useVartaStatus, useNow, Freshness, PowerFlow,
} from '../../components/energy_flow'
import styles from '../../styles/stauperle.module.scss'

// The full /varta dashboard (history, bought and sold, device details) over the kiosk page.
function DetailsOverlay({ onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    // Keep the kiosk's idle timer from sending it home while someone reads the dashboard.
    const forwardActivity = (e) => {
        const reportActivity = () => window.dispatchEvent(new Event(KIOSK_ACTIVITY))
        for (const name of ['pointerdown', 'touchstart', 'keydown']) {
            e.currentTarget.contentWindow?.addEventListener(name, reportActivity, { passive: true })
        }
    }

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Home Energy">
            <div className={styles.overlayBar}>
                <span className={styles.overlayTitle}>Home Energy</span>
                <button type="button" className={styles.overlayClose} onClick={onClose}>
                    <CloseIcon /> Close
                </button>
            </div>
            <iframe className={styles.overlayFrame} src="/varta" title="Home Energy" onLoad={forwardActivity} />
        </div>
    )
}

// Live overview of the VARTA battery and grid, read on the home network or pushed from it (same API as /varta).
export default function Sunbank() {
    const [details, setDetails] = useState(false)
    const { data, lastSuccess, error, unavailable, unpaired, retry } = useVartaStatus()
    const now = useNow()

    if (unavailable || unpaired || !data) {
        return (
            <KioskLayout title="Sunbank">
                <section className={`${styles.placeholder} ${styles.sun}`}>
                    <SunbankIcon />
                    <h2>{unpaired ? 'Enter the family key' : 'Sunbank'}</h2>
                    <p>
                        {unpaired
                            ? 'This device needs the key once to show the battery. It’s remembered afterwards.'
                            : unavailable
                                ? 'Live battery data is only available on the home network.'
                                : error ? `Can’t reach the battery – ${error}. Retrying…` : 'Connecting to the battery…'}
                    </p>
                    {unpaired && <PairForm onPaired={retry} />}
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

    const detailsButton = (
        <button type="button" className={styles.detailsButton} onClick={() => setDetails(true)}>
            More details <span aria-hidden="true">›</span>
        </button>
    )

    return (
        <KioskLayout title="Sunbank" actions={detailsButton}>
            {details && <DetailsOverlay onClose={() => setDetails(false)} />}
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

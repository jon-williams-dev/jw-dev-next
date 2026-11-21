import { useEffect, useState } from 'react'
import KioskLayout, { PairForm, kioskFetch } from '../../components/kiosk_layout'
import KioskOverlay from '../../components/kiosk_overlay'
import { SunbankIcon } from '../../components/kiosk_icons'
import {
    LIVE_MS, IDLE_W, fmtPower, splitPower, fmtKwh, batteryEta, summary, useVartaStatus, useNow, Freshness, PowerFlow,
} from '../../components/energy_flow'
import { BUY_CT, SELL_CT, fmtEuro } from '../../lib/energy_prices'
import styles from '../../styles/stauperle.module.scss'

const TODAY_MS = 5 * 60 * 1000

// Today's grid import and export (Wh) from the recorded history, refreshed every few minutes.
function useTodayGrid() {
    const [today, setToday] = useState(null)
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await kioskFetch('/api/varta/history?range=24h', { cache: 'no-store', signal: AbortSignal.timeout(15000) })
                if (!res.ok) return
                const day = (await res.json()).days?.at(-1)
                if (!cancelled && day) setToday(day)
            } catch { /* keep the last figures */ }
        }
        load()
        const id = setInterval(load, TODAY_MS)
        return () => { cancelled = true; clearInterval(id) }
    }, [])
    return today
}

// Live overview of the VARTA battery and grid, read on the home network or pushed from it (same API as /varta).
export default function Sunbank() {
    const [details, setDetails] = useState(false)
    const { data, lastSuccess, error, unavailable, unpaired, retry } = useVartaStatus()
    const now = useNow()
    const today = useTodayGrid()

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
        <button type="button" className={styles.headerButton} onClick={() => setDetails(true)}>
            More details <span aria-hidden="true">›</span>
        </button>
    )

    return (
        <KioskLayout title="Sunbank" actions={detailsButton}>
            {/* The full /varta dashboard: history, bought and sold, device details. */}
            {details && <KioskOverlay title="Home Energy" src="/varta" onClose={() => setDetails(false)} />}
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
                        {/* Estimated from the battery's grid readings, not the meter: hence the ≈. */}
                        {today && (
                            <div className={`${styles.sunFacts} ${styles.sunToday}`}>
                                <span>Today ≈</span>
                                <span><b>{fmtEuro(today.importWh / 1000 * BUY_CT / 100)}</b> bought</span>
                                <span><b>{fmtEuro(today.exportWh / 1000 * SELL_CT / 100)}</b> sold</span>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </KioskLayout>
    )
}

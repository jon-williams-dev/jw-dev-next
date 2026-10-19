import Head from 'next/head'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

import {
    POLL_MS, LIVE_MS, IDLE_W, fmtPower, splitPower, fmtKwh, batteryEta, summary, useVartaStatus, useNow, Freshness, PowerFlow,
} from '../components/energy_flow'

const VartaCharts = dynamic(() => import('../components/varta_charts'), { ssr: false })

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

// ── icons ────────────────────────────────────────────────────────────────────

const Icon = ({ name, size = 24 }) => {
    const paths = {
        sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
        grid: <path d="M8 22 12 2l4 20M6 8h12M7 13h10M9.5 8 14 13M14.5 8 10 13M5 22h14" />,
        home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M13 12l-2.5 4h3L11 20" /></>,
        battery: <><rect x="6" y="4" width="12" height="18" rx="2.5" /><path d="M10 2h4" /><path d="M13 9l-2.5 4h3L11 17" /></>,
    }
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    )
}

// ── pieces ───────────────────────────────────────────────────────────────────

function BatteryGauge({ charge, power }) {
    const state = power > IDLE_W ? 'charging' : power < -IDLE_W ? 'discharging' : 'idle'
    return (
        <div className={`gauge ${state}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={charge} aria-label="Battery charge">
            <div className="gauge-fill" style={{ height: `${charge}%` }} />
            <div className="gauge-text"><div>{charge}<span>%</span></div></div>
        </div>
    )
}

const powerFactor = ({ power, apparentPower }) =>
    Math.abs(apparentPower) >= IDLE_W ? (Math.abs(power) / Math.abs(apparentPower)).toFixed(2) : '–'

const clockLabel = ({ clock, clockDriftS }) => {
    if (!clock) return '–'
    const drift = Math.abs(clockDriftS)
    return drift <= 5 ? 'In sync' : `${drift < 120 ? `${drift} s` : `${Math.round(drift / 60)} min`} ${clockDriftS > 0 ? 'ahead' : 'behind'}`
}

// How hard the battery is working, against its configured charge/discharge limit.
function PowerLimit({ battery }) {
    const charging = battery.power > IDLE_W
    const limit = charging ? battery.maxChargeW : battery.maxDischargeW
    if (!limit) return null
    const share = Math.min(100, (Math.abs(battery.power) / limit) * 100)
    return (
        <div className="limit">
            <div className="limit-head">
                <span>{charging ? 'Charge' : 'Discharge'} load</span>
                <span>{Math.abs(battery.power) < IDLE_W ? 'idle' : `${Math.round(share)}% of ${fmtPower(limit)}`}</span>
            </div>
            <div className="meter battery"><div style={{ width: `${Math.abs(battery.power) < IDLE_W ? 0 : share}%` }} /></div>
            <div className="limit-foot">Limits: charge {fmtPower(battery.maxChargeW)} · discharge {fmtPower(battery.maxDischargeW)}</div>
        </div>
    )
}

function Stat({ label, value, unit, note }) {
    return (
        <div className="stat">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}{unit && <span className="unit">{unit}</span>}</div>
            {note && <div className="stat-note">{note}</div>}
        </div>
    )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Varta() {
    const { data, lastSuccess, error, unavailable } = useVartaStatus()
    const now = useNow()
    const stale = !lastSuccess || now - lastSuccess >= LIVE_MS || !!error

    const battery = data?.battery
    const grid = data?.grid
    const device = data?.device || {}
    const eta = battery && batteryEta(battery)
    const headline = data && summary(battery, grid)
    const bp = battery && splitPower(battery.power)
    const gp = grid && splitPower(grid.direction === 'idle' ? 0 : grid.power)

    return (
        <div className={`energy ${inter.className}`}>
            <Head>
                <title>Home Energy</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="robots" content="noindex" />
                <meta name="theme-color" content="#f3f5f9" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#0a0e17" media="(prefers-color-scheme: dark)" />
            </Head>

            <header className="bar">
                <div className="brand">
                    <span className="mark"><Icon name="battery" size={18} /></span>
                    <div>
                        <div className="brand-name">Home Energy</div>
                        <div className="brand-sub">VARTA element · 6 kWh</div>
                    </div>
                </div>
                {!unavailable && <Freshness lastSuccess={lastSuccess} error={error} now={now} />}
            </header>

            <main className="wrap">
                {unavailable && (
                    <div className="card notice">
                        <h2>Available on the home network only</h2>
                        <p>This dashboard reads the battery directly over the local network, so it only works where the site runs at home.</p>
                    </div>
                )}

                {!unavailable && !data && (
                    <div className="card notice">
                        {error
                            ? <><h2>Can't reach the battery</h2><p>{error}. Retrying every {POLL_MS / 1000} seconds.</p></>
                            : <div className="loading"><span /><span /><span /></div>}
                    </div>
                )}

                {data && (
                    <div className={`layout ${stale ? 'is-stale' : ''}`}>
                        <section className={`hero card tone-${headline.tone}`}>
                            <p className="headline">{headline.text}</p>
                            <PowerFlow battery={battery} grid={grid} />
                        </section>

                        <section className="card battery-card">
                            <div className="card-head">
                                <h2>Battery</h2>
                                <span className={`chip s${battery.status}`}>{battery.statusLabel}</span>
                            </div>
                            <div className="battery-body">
                                <BatteryGauge charge={battery.charge} power={battery.power} />
                                <div className="battery-stats">
                                    <Stat label="Stored" value={fmtKwh(battery.capacityWh * battery.charge / 100).replace(' kWh', '')} unit="kWh"
                                        note={`of ${fmtKwh(battery.capacityWh)}`} />
                                    <Stat label={battery.power > IDLE_W ? 'Charging' : battery.power < -IDLE_W ? 'Discharging' : 'Power'}
                                        value={Math.abs(battery.power) < IDLE_W ? '0' : bp.value} unit={Math.abs(battery.power) < IDLE_W ? 'W' : bp.unit} />
                                    {eta && <Stat label={eta.label} value={eta.in} note={`until ~${eta.at}`} />}
                                </div>
                            </div>
                            <PowerLimit battery={battery} />
                        </section>

                        <section className={`card grid-card ${grid.direction}`}>
                            <div className="card-head">
                                <h2>Grid</h2>
                                <span className="chip">{grid.direction === 'import' ? 'Importing' : grid.direction === 'export' ? 'Exporting' : 'Balanced'}</span>
                            </div>
                            <div className="big">{gp.value}<span className="unit">{gp.unit}</span></div>
                            <div className="meter"><div style={{ width: `${Math.min(100, Math.abs(grid.power) / 50)}%` }} /></div>
                            <p className="muted">{grid.direction === 'import' ? 'Buying electricity' : grid.direction === 'export' ? 'Selling surplus' : 'Not buying or selling'}</p>
                        </section>

                        <section className="card solar-card">
                            <div className="card-head">
                                <h2>Solar & home use</h2>
                                <span className="chip">Soon</span>
                            </div>
                            <div className="shimmer" />
                            <p className="muted">Production, household consumption and self-sufficiency will appear once the Kostal inverter is connected.</p>
                        </section>

                        <section className="card system-card">
                            <div className="card-head"><h2>Lifetime & device</h2></div>
                            <div className="facts">
                                <Stat label="Charged all-time" value={Math.round(battery.chargedTotalWh / 1000).toLocaleString('en-GB')} unit="kWh"
                                    note={`≈ ${Math.round(battery.chargedTotalWh / battery.capacityWh).toLocaleString('en-GB')} full cycles`} />
                                <Stat label="Capacity" value={(battery.capacityWh / 1000).toLocaleString('en-GB', { maximumFractionDigits: 1 })} unit="kWh"
                                    note={`${battery.modules} module${battery.modules === 1 ? '' : 's'}`} />
                                <Stat label="Power factor" value={powerFactor(battery)}
                                    note={battery.apparentPower ? `${fmtPower(battery.power)} real · ${Math.abs(battery.apparentPower)} VA apparent` : 'battery idle'} />
                                <Stat label="Last reading" value={lastSuccess ? new Date(lastSuccess).toLocaleTimeString('en-GB') : '–'}
                                    note={`every ${POLL_MS / 1000} s`} />
                            </div>
                            <dl className="details">
                                <div><dt>Model</dt><dd>{device.model} · {fmtKwh(battery.capacityWh)}</dd></div>
                                <div><dt>Serial number</dt><dd>{device.serial || '–'}</dd></div>
                                <div><dt>Software</dt><dd>{device.softwareVersion || '–'}</dd></div>
                                <div><dt>EMS firmware</dt><dd>{device.emsVersion || '–'}</dd></div>
                                <div><dt>ENS firmware</dt><dd>{device.ensVersion || '–'}</dd></div>
                                <div><dt>Energy meter</dt><dd>{device.energyMeterSerial || '–'}</dd></div>
                                <div><dt>Battery clock</dt><dd>{clockLabel(device)}</dd></div>
                                <div><dt>Modbus table</dt><dd>v{device.tableVersion}</dd></div>
                            </dl>
                        </section>
                    </div>
                )}

                {data && <VartaCharts />}
            </main>

            <style jsx global>{`
                html, body { background: var(--bg); }
                .energy {
                    --bg: #f3f5f9; --card: #ffffff; --card-2: #f7f8fb; --line: #e6e9f0;
                    --text: #0f172a; --muted: #64748b; --faint: #94a3b8;
                    --solar: #f59e0b; --grid: #3b82f6; --battery: #10b981; --home: #6366f1; --danger: #ef4444;
                    --shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06);
                    --c-battery: #059669; --c-grid: #2563eb;   /* chart series, validated against --card */
                    min-height: 100vh; min-height: 100dvh; background: var(--bg); color: var(--text);
                    font-feature-settings: 'tnum' 1, 'cv11' 1; -webkit-font-smoothing: antialiased;
                    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
                }
                @media (prefers-color-scheme: dark) {
                    .energy {
                        --bg: #0a0e17; --card: #121826; --card-2: #182031; --line: #232c3f;
                        --text: #e8edf6; --muted: #8b97ad; --faint: #5d6880;
                        --shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 10px 30px rgba(0, 0, 0, 0.35);
                        --c-battery: #0e9f6e; --c-grid: #3b82f6;
                    }
                }
                .energy *, .energy *::before, .energy *::after { box-sizing: border-box; }
                .energy h2 { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin: 0; }
                .energy p { margin: 0; color: inherit; }
                .energy .stat-value, .energy .big, .energy .headline, .energy .brand-name { color: var(--text); }

                /* top bar */
                .energy .bar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
                    max-width: 1180px; margin: 0 auto; padding: 1rem 1rem 0.75rem;
                    background: linear-gradient(var(--bg) 70%, transparent); }
                .energy .brand { display: flex; align-items: center; gap: 0.7rem; }
                .energy .mark { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 0.8rem; color: #fff;
                    background: linear-gradient(135deg, var(--battery), var(--grid)); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3); }
                .energy .brand-name { font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
                .energy .brand-sub { font-size: 0.78rem; color: var(--muted); }

                .energy .pill { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 999px;
                    font-size: 0.8rem; font-weight: 600; background: var(--card); border: 1px solid var(--line); color: var(--muted); white-space: nowrap; }
                .energy .pill-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--faint); }
                .energy .pill.live { color: var(--battery); }
                .energy .pill.live .pill-dot { background: var(--battery); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); animation: e-ping 2s infinite; }
                .energy .pill.delayed { color: var(--solar); }
                .energy .pill.delayed .pill-dot { background: var(--solar); }
                .energy .pill.stale { color: var(--danger); }
                .energy .pill.stale .pill-dot { background: var(--danger); }
                @keyframes e-ping { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55) } 70%, 100% { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0) } }

                /* layout */
                .energy .wrap { max-width: 1180px; margin: 0 auto; padding: 0.25rem 1rem 2.5rem; }
                .energy .layout { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); transition: opacity 0.4s, filter 0.4s; }
                .energy .layout.is-stale { opacity: 0.55; filter: saturate(0.4); }
                @media (min-width: 720px) {
                    .energy .layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .energy .hero, .energy .system-card { grid-column: 1 / -1; }
                }
                @media (min-width: 1080px) {
                    .energy .layout { grid-template-columns: 1.15fr 1fr 1fr; }
                    .energy .hero { grid-column: 1 / span 2; grid-row: 1 / span 2; }
                    .energy .battery-card { grid-column: 3; grid-row: 1; }
                    .energy .grid-card { grid-column: 3; grid-row: 2; }
                    .energy .solar-card { grid-column: 1; }
                    .energy .system-card { grid-column: 2 / span 2; }
                }

                .energy .card { background: var(--card); border: 1px solid var(--line); border-radius: 1.25rem; padding: 1.15rem 1.25rem; box-shadow: var(--shadow); }
                .energy .card-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; }
                .energy .chip { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; background: var(--card-2); color: var(--muted); border: 1px solid var(--line); }
                .energy .chip.s2 { color: var(--battery); }
                .energy .chip.s3 { color: var(--battery); }
                .energy .chip.s5, .energy .chip.s6 { color: var(--danger); }
                .energy .muted { color: var(--muted); font-size: 0.875rem; line-height: 1.45; }

                .energy .notice { max-width: 560px; margin: 3rem auto; text-align: center; padding: 2rem; }
                .energy .notice h2 { font-size: 1rem; text-transform: none; letter-spacing: 0; color: var(--text); margin-bottom: 0.5rem; }
                .energy .notice p { color: var(--muted); }
                .energy .loading { display: flex; gap: 0.4rem; justify-content: center; }
                .energy .loading span { width: 0.55rem; height: 0.55rem; border-radius: 50%; background: var(--faint); animation: e-bounce 1.2s infinite; }
                .energy .loading span:nth-child(2) { animation-delay: 0.15s; }
                .energy .loading span:nth-child(3) { animation-delay: 0.3s; }
                @keyframes e-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4 } 40% { transform: translateY(-6px); opacity: 1 } }

                /* hero + flow */
                .energy .hero { position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .energy .hero::before { content: ''; position: absolute; inset: -40% -20% auto auto; width: 70%; aspect-ratio: 1; border-radius: 50%;
                    background: radial-gradient(closest-side, var(--glow, rgba(16, 185, 129, 0.12)), transparent); pointer-events: none; }
                .energy .hero.tone-grid { --glow: rgba(59, 130, 246, 0.14); }
                .energy .hero.tone-solar { --glow: rgba(245, 158, 11, 0.16); }
                .energy .hero.tone-idle { --glow: rgba(100, 116, 139, 0.1); }
                .energy .headline { position: relative; font-size: clamp(1.2rem, 2.6vw, 1.6rem); font-weight: 600; letter-spacing: -0.01em; line-height: 1.25; }
                .energy .headline b { font-weight: 700; }
                .energy .tone-battery .headline b { color: var(--battery); }
                .energy .tone-grid .headline b { color: var(--grid); }
                .energy .tone-solar .headline b { color: var(--solar); }



                @media (max-width: 600px) {
                }

                /* battery */
                .energy .battery-body { display: flex; align-items: center; gap: 1.5rem; }
                .energy .gauge { position: relative; flex: none; width: 5.5rem; height: 9.5rem; border-radius: 1.1rem; background: var(--card-2); border: 2px solid var(--line); overflow: hidden; }
                .energy .gauge::before { content: ''; position: absolute; top: -2px; left: 50%; width: 1.75rem; height: 0.35rem; transform: translate(-50%, -100%); }
                .energy .gauge-fill { position: absolute; inset: auto 0 0 0; background: linear-gradient(to top, var(--battery), color-mix(in srgb, var(--battery) 60%, #a7f3d0)); transition: height 0.8s ease; }
                .energy .gauge.charging .gauge-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, transparent, rgba(255, 255, 255, 0.35), transparent);
                    background-size: 100% 200%; animation: e-rise 2.2s linear infinite; }
                @keyframes e-rise { from { background-position: 0 100% } to { background-position: 0 -100% } }
                .energy .gauge-text { position: absolute; inset: 0; display: grid; place-items: center; font-size: 1.6rem; font-weight: 700; color: var(--text); text-shadow: 0 1px 8px var(--card); }
                .energy .gauge-text span { font-size: 0.9rem; font-weight: 600; margin-left: 1px; }
                .energy .battery-stats { display: grid; gap: 0.9rem; min-width: 0; }

                .energy .stat-label { font-size: 0.78rem; color: var(--muted); margin-bottom: 0.1rem; }
                .energy .stat-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em; line-height: 1.15; white-space: nowrap; }
                .energy .unit { font-size: 0.8em; font-weight: 500; color: var(--muted); margin-left: 0.25em; }
                .energy .stat-note { font-size: 0.78rem; color: var(--faint); margin-top: 0.1rem; }

                /* grid */
                .energy .big { font-size: 2.6rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; margin-bottom: 0.9rem; }
                .energy .big .unit { font-size: 1rem; }
                .energy .grid-card.import .big { color: var(--grid); }
                .energy .grid-card.export .big { color: var(--battery); }
                .energy .meter { height: 0.4rem; border-radius: 999px; background: var(--card-2); overflow: hidden; margin-bottom: 0.75rem; }
                .energy .meter div { height: 100%; border-radius: inherit; background: var(--grid); transition: width 0.6s ease; }
                .energy .grid-card.export .meter div { background: var(--battery); }

                /* solar placeholder */
                .energy .shimmer { height: 3.5rem; border-radius: 0.8rem; margin-bottom: 0.9rem;
                    background: linear-gradient(90deg, var(--card-2) 0%, color-mix(in srgb, var(--solar) 14%, var(--card-2)) 50%, var(--card-2) 100%);
                    background-size: 200% 100%; animation: e-shimmer 2.5s ease-in-out infinite; }
                @keyframes e-shimmer { from { background-position: 100% 0 } to { background-position: -100% 0 } }

                /* system */
                .energy .facts { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
                .energy .details { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0 1.5rem; margin: 1.25rem 0 0; padding-top: 0.75rem; border-top: 1px solid var(--line); }
                .energy .details > div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px dashed var(--line); font-size: 0.875rem; }
                .energy .details dt { color: var(--muted); }
                .energy .details dd { margin: 0; font-weight: 600; color: var(--text); text-align: right; font-variant-numeric: tabular-nums; }

                /* power limit */
                .energy .limit { margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid var(--line); }
                .energy .limit-head { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.45rem; }
                .energy .limit-head span:last-child { color: var(--text); font-weight: 600; }
                .energy .limit .meter { margin-bottom: 0.45rem; }
                .energy .meter.battery div { background: var(--battery); }
                .energy .limit-foot { font-size: 0.75rem; color: var(--faint); }

                /* history */
                .energy .history { margin-top: 2rem; }
                .energy .history-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
                .energy .section-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em; text-transform: none; color: var(--text); margin-bottom: 0.15rem; }
                .energy .segmented { display: inline-flex; padding: 3px; border-radius: 999px; background: var(--card); border: 1px solid var(--line); overflow-x: auto; max-width: 100%; }
                .energy .segmented button { border: 0; background: none; font: inherit; font-size: 0.85rem; font-weight: 600; color: var(--muted);
                    padding: 0.4rem 0.85rem; border-radius: 999px; cursor: pointer; white-space: nowrap; min-height: 2.1rem; }
                .energy .segmented button.on { background: var(--text); color: var(--card); }
                .energy .history-body { transition: opacity 0.3s; }
                .energy .history-body.is-loading { opacity: 0.6; }
                .energy .h-tiles { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 1rem; }
                @media (min-width: 900px) { .energy .h-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
                .energy .h-tile { background: var(--card); border: 1px solid var(--line); border-radius: 1rem; padding: 0.9rem 1.1rem; box-shadow: var(--shadow); }
                .energy .h-tile-value { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.01em; color: var(--text); }
                .energy .charts { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
                @media (min-width: 1080px) { .energy .charts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                .energy .chart-box { position: relative; height: 260px; }
                .energy .chart-legend { display: flex; gap: 0.9rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--muted); }
                .energy .chart-legend span { display: inline-flex; align-items: center; gap: 0.4rem; }
                .energy .chart-legend b { color: var(--text); font-weight: 600; margin-left: 0.15rem; }
                .energy .key-line { display: inline-block; width: 14px; height: 2px; border-radius: 2px; }
                .energy .key-bar { display: inline-block; width: 10px; height: 10px; border-radius: 3px; }
                .energy .notice.slim { margin: 0 0 1rem; max-width: none; padding: 1rem 1.25rem; text-align: left; }
                .energy .table-view { margin-top: 0.75rem; font-size: 0.85rem; }
                .energy .table-view summary { cursor: pointer; color: var(--muted); font-weight: 600; width: max-content; }
                .energy .table-scroll { max-height: 260px; overflow: auto; margin-top: 0.5rem; border: 1px solid var(--line); border-radius: 0.6rem; }
                .energy table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
                .energy th, .energy td { text-align: right; padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--line); color: var(--text); }
                .energy th { position: sticky; top: 0; background: var(--card-2); color: var(--muted); font-weight: 600; }
                .energy th:first-child, .energy td:first-child { text-align: left; }

                @media (prefers-reduced-motion: reduce) {
                    .energy *, .energy *::before, .energy *::after { animation: none !important; transition: none !important; }
                }
            `}</style>
        </div>
    )
}

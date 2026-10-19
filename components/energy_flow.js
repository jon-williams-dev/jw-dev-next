// Live energy pieces shared by /varta and the Stauperle 13 kiosk (/stauperle13/sunbank):
// formatting, the polling hook, the freshness pill and the power-flow diagram.
// The diagram takes its colours from CSS variables on any ancestor:
//   --solar --grid --battery --home --line --text --muted --faint --card

import { useEffect, useRef, useState } from 'react'

export const POLL_MS = 5000
export const LIVE_MS = 15000      // newer than this counts as live
export const DELAYED_MS = 60000   // older than this counts as stale
export const IDLE_W = 15          // below this, treat power as zero

// ── formatting ───────────────────────────────────────────────────────────────

export const fmtPower = (w) => {
    const a = Math.abs(w)
    return a < 1000 ? `${Math.round(a)} W` : `${(a / 1000).toLocaleString('en-GB', { maximumFractionDigits: 2 })} kW`
}
export const splitPower = (w) => {
    const [value, unit] = fmtPower(w).split(' ')
    return { value, unit }
}
export const fmtKwh = (wh, digits = 1) => `${(wh / 1000).toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits })} kWh`
export const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
export const fmtAgo = (ms) => ms < 60000 ? `${Math.max(0, Math.round(ms / 1000))}s ago` : `${Math.round(ms / 60000)} min ago`
export const fmtDuration = (h) => {
    const mins = Math.round(h * 60)
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`
}

// Rough time until full/empty at the current rate (ignores reserve and taper).
export function batteryEta({ charge, power, capacityWh }) {
    if (Math.abs(power) < IDLE_W) return null
    const wh = power > 0 ? capacityWh * (1 - charge / 100) : capacityWh * (charge / 100)
    const hours = wh / Math.abs(power)
    if (hours > 48) return null
    return { label: power > 0 ? 'Full in' : 'Lasts', in: fmtDuration(hours), at: fmtTime(new Date(Date.now() + hours * 3600000)) }
}

// One plain-language sentence for the current state.
export function summary(battery, grid) {
    if (grid.direction === 'import') return { tone: 'grid', text: <>Drawing <b>{fmtPower(grid.power)}</b> from the grid</> }
    if (battery.power < -IDLE_W) return { tone: 'battery', text: <>Running on battery · <b>{fmtPower(battery.power)}</b></> }
    if (battery.power > IDLE_W) return { tone: 'battery', text: <>Charging the battery · <b>{fmtPower(battery.power)}</b></> }
    if (grid.direction === 'export') return { tone: 'solar', text: <>Exporting <b>{fmtPower(grid.power)}</b> to the grid</> }
    return { tone: 'idle', text: <>All quiet: battery and grid idle</> }
}

// ── data ─────────────────────────────────────────────────────────────────────

// Polls /api/varta/status without overlapping requests, pausing while the tab is hidden.
export function useVartaStatus() {
    const [data, setData] = useState(null)          // last good reading
    const [lastSuccess, setLastSuccess] = useState(null)
    const [error, setError] = useState(null)
    const [unavailable, setUnavailable] = useState(false)
    const timer = useRef(null)

    useEffect(() => {
        let cancelled = false

        const poll = async () => {
            clearTimeout(timer.current)
            try {
                const res = await fetch('/api/varta/status', { cache: 'no-store', signal: AbortSignal.timeout(8000) })
                if (res.status === 404) { if (!cancelled) setUnavailable(true); return }
                const body = await res.json()
                if (cancelled) return
                if (body.connected) {
                    setData(body)
                    setLastSuccess(Date.parse(body.timestamp))
                    setError(null)
                } else {
                    setError(body.error || 'Battery not responding')
                }
            } catch (err) {
                if (!cancelled) setError(err.name === 'TimeoutError' ? 'Request timed out' : 'Could not reach the server')
            }
            if (!cancelled && !document.hidden) timer.current = setTimeout(poll, POLL_MS)
        }

        const onVisibility = () => {
            clearTimeout(timer.current)
            if (!document.hidden) poll()
        }

        poll()
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            cancelled = true
            clearTimeout(timer.current)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])

    return { data, lastSuccess, error, unavailable }
}

export function useNow(interval = 1000) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), interval)
        return () => clearInterval(id)
    }, [interval])
    return now
}

export function Freshness({ lastSuccess, error, now }) {
    const age = lastSuccess ? now - lastSuccess : Infinity
    const level = !lastSuccess ? (error ? 'stale' : 'connecting') : age < LIVE_MS && !error ? 'live' : age < DELAYED_MS ? 'delayed' : 'stale'
    const text = !lastSuccess
        ? (error ? 'Offline' : 'Connecting')
        : level === 'live' ? `Live · ${fmtAgo(age)}` : `${error ? 'Offline' : 'Delayed'} · ${fmtAgo(age)}`
    return (
        <div className={`pill ${level}`} role="status">
            <span className="pill-dot" />
            {text}
        </div>
    )
}

// Dots travel along a path; faster for more power. `reverse` flips direction.
function Flow({ d, power, tone, reverse, off }) {
    const active = !off && Math.abs(power) >= IDLE_W
    const dur = active ? Math.max(0.9, Math.min(4, 2400 / Math.abs(power))).toFixed(1) : 0
    return (
        <g className={`flow-line ${tone} ${active ? 'active' : ''} ${off ? 'off' : ''}`}>
            <path d={d} className="track" />
            {active && [0, 1, 2].map((i) => (
                <circle key={`${i}-${dur}-${reverse}`} r="3.2" className="dot">
                    <animateMotion dur={`${dur}s`} begin={`${(i * dur) / 3}s`} repeatCount="indefinite" path={d}
                        keyPoints={reverse ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" />
                </circle>
            ))}
        </g>
    )
}

// Small illustrations for the flow diagram, drawn on a 64×64 grid.
const ILLUSTRATIONS = {
    solar: () => (
        <>
            <defs>
                <radialGradient id="il-sun" cx="0.4" cy="0.4" r="0.6">
                    <stop offset="0" stopColor="#fef08a" /><stop offset="0.6" stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" />
                </radialGradient>
                <linearGradient id="il-panel" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" />
                </linearGradient>
            </defs>
            <g stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round">
                <path d="M46 4v4M46 28v-2M34 16h2M58 16h-2M37.5 7.5l2 2M54.5 7.5l-2 2" />
            </g>
            <circle cx="46" cy="16" r="7.5" fill="url(#il-sun)" />
            <path d="M18 50l-2 9M46 50l2 9M12 59h40" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
            <polygon points="12,25 50,25 58,50 4,50" fill="url(#il-panel)" stroke="#e2e8f0" strokeWidth="1.6" strokeLinejoin="round" />
            <g stroke="#93c5fd" strokeOpacity="0.55" strokeWidth="0.9">
                <path d="M21.5 25l-4 25M31 25v25M40.5 25l4 25" />
                <path d="M9.3 33.3h43.4M6.7 41.7h48.6" />
            </g>
            <polygon points="14,25 24,25 13,50 6,50" fill="#fff" opacity="0.14" />
        </>
    ),
    grid: () => (
        <>
            <defs>
                <linearGradient id="il-steel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#cbd5e1" /><stop offset="1" stopColor="#64748b" />
                </linearGradient>
            </defs>
            <path d="M0 22q8 4 13 2M51 24q5 2 13-2M0 33q9 4 17 2M47 35q8 2 17-2" fill="none" stroke="#3b82f6" strokeWidth="1.3" strokeOpacity="0.8" />
            <g fill="none" stroke="url(#il-steel)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
                <path d="M29 5h6M29 5L19 60M35 5l10 55" />
                <path d="M12 17h40M16 29h32" />
                <path d="M27 17l9.5 12M37 17l-9.5 12M25 29l12.5 15M39 29l-12.5 15M22.5 44l17.5 16M41.5 44l-17.5 16" strokeWidth="1.4" />
                <path d="M23 44h18" strokeWidth="1.6" />
            </g>
            <g stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
                <path d="M13 17v6M51 17v6M17 29v5M47 29v5" />
            </g>
            <g fill="#e2e8f0"><circle cx="13" cy="24" r="1.6" /><circle cx="51" cy="24" r="1.6" /><circle cx="17" cy="35" r="1.6" /><circle cx="47" cy="35" r="1.6" /></g>
        </>
    ),
    // 3/4 view: gable end on the left, long side with roof panels on the right.
    home: () => (
        <>
            <defs>
                <linearGradient id="il-front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e2e8f0" /></linearGradient>
                <linearGradient id="il-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#dfe5ec" /><stop offset="1" stopColor="#c3ccd8" /></linearGradient>
                <linearGradient id="il-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#475569" /><stop offset="1" stopColor="#1e293b" /></linearGradient>
                <linearGradient id="il-roof-pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient>
                <radialGradient id="il-light" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.6" stopColor="#fcd34d" /><stop offset="1" stopColor="#f59e0b" /></radialGradient>
            </defs>
            <ellipse cx="33" cy="58" rx="27" ry="4" fill="#000" opacity="0.12" />
            <polygon points="30,43 56,30 56,47 30,60" fill="url(#il-side)" />
            <polygon points="8,32 19,21.5 30,43 30,60 8,49" fill="url(#il-front)" stroke="#cbd5e1" strokeWidth="0.6" strokeLinejoin="round" />
            <polygon points="19,21.5 45,8.5 57,30.5 31,43.5" fill="url(#il-roof)" />
            <polygon points="23.8,23.2 43.5,13.3 51.2,28.3 31.5,38.2" fill="url(#il-roof-pv)" stroke="#93c5fd" strokeWidth="0.5" />
            <path d="M30.35 19.9L38.05 34.9M36.95 16.6L44.65 31.6M27.6 30.7L47.4 20.8" stroke="#93c5fd" strokeOpacity="0.6" strokeWidth="0.6" />
            <path d="M7 33L19 21.5L45 8.5" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30.5 44L57 30.7" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
            <polygon points="33.9,45.3 40.4,42.05 40.4,48.85 33.9,52.1" fill="url(#il-light)" stroke="#94a3b8" strokeWidth="0.7" />
            <polygon points="44.3,40.1 52.1,36.2 52.1,43 44.3,46.9" fill="url(#il-light)" stroke="#94a3b8" strokeWidth="0.7" />
            <polygon points="16.4,42.2 21.6,44.8 21.6,55.8 16.4,53.2" fill="#475569" />
            <circle cx="20.6" cy="49.9" r="0.6" fill="#fbbf24" />
            <ellipse cx="19" cy="32" rx="2.2" ry="2.6" fill="url(#il-light)" stroke="#94a3b8" strokeWidth="0.6" />
        </>
    ),
    battery: ({ charge = 0 }) => {
        const lit = Math.round((charge / 100) * 5)
        return (
            <>
                <defs>
                    <linearGradient id="il-cabinet" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#f1f5f9" /><stop offset="1" stopColor="#cbd5e1" />
                    </linearGradient>
                </defs>
                <ellipse cx="32" cy="60" rx="17" ry="2.2" fill="#000" opacity="0.15" />
                <rect x="17" y="5" width="30" height="54" rx="3.5" fill="url(#il-cabinet)" stroke="#cbd5e1" strokeWidth="1.2" />
                <path d="M17 11.5V8.5A3.5 3.5 0 0 1 20.5 5h23A3.5 3.5 0 0 1 47 8.5v3z" fill="#1f2937" />
                <rect x="21" y="16" width="6" height="2" rx="1" fill="#dc2626" />
                <g transform="translate(39 20)">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <rect key={i} x="0" y={(4 - i) * 6} width="3.5" height="4.2" rx="1"
                            fill={i < lit ? '#22c55e' : '#e2e8f0'} stroke={i < lit ? '#16a34a' : '#cbd5e1'} strokeWidth="0.5" />
                    ))}
                </g>
                <text x="27" y="44" transform="rotate(-90 27 44)" fontSize="5.5" fontWeight="800" fill="#1f2937" letterSpacing="0.6" style={{ fontFamily: 'Arial, sans-serif' }}>VARTA</text>
            </>
        )
    },
}

function Node({ x, y, r = 34, tone, label, value, sub, off, illustration }) {
    const size = r * 1.7
    const Art = ILLUSTRATIONS[tone]
    return (
        <g className={`node ${tone} ${off ? 'off' : ''}`} transform={`translate(${x} ${y})`}>
            <circle r={r + 8} className="halo" />
            <circle r={r} className="disc" />
            <svg x={-size / 2} y={-size / 2} width={size} height={size} viewBox="0 0 64 64" overflow="visible">
                <Art {...illustration} />
            </svg>
            <text y={r + 24} className="node-label">{label}</text>
            {value && <text y={r + 46} className="node-value">{value}</text>}
            {sub && <text y={r + (value ? 64 : 44)} className="node-sub">{sub}</text>}
        </g>
    )
}

export function PowerFlow({ battery, grid }) {
    // House in the middle; solar above, grid left, battery right.
    const H = { x: 200, y: 150 }
    return (
        <svg className="pflow" viewBox="0 0 400 262" role="img"
            aria-label={`Battery ${battery.power > IDLE_W ? 'charging' : battery.power < -IDLE_W ? 'discharging' : 'idle'} ${fmtPower(battery.power)}; grid ${grid.direction === 'idle' ? 'balanced' : `${grid.direction}ing ${fmtPower(grid.power)}`}`}>
            <Flow d="M200 74 L200 108" power={0} tone="solar" off />
            <Flow d="M78 150 L158 150" power={grid.power} tone="grid" reverse={grid.direction === 'export'} off={grid.direction === 'idle'} />
            <Flow d="M242 150 L322 150" power={battery.power} tone="battery" reverse={battery.power < 0} />

            <Node x={200} y={40} r={30} tone="solar" label="" off />
            <text x={238} y={36} className="node-label start dim">Solar</text>
            <text x={238} y={52} className="node-sub start">waiting for Kostal</text>

            <Node x={44} y={150} tone="grid" label="Grid"
                value={grid.direction === 'idle' ? '0 W' : fmtPower(grid.power)}
                sub={grid.direction === 'idle' ? 'balanced' : grid.direction === 'import' ? 'importing' : 'exporting'} />
            <Node x={H.x} y={H.y} r={42} tone="home" label="Home" />
            <Node x={356} y={150} tone="battery" label="Battery" illustration={{ charge: battery.charge }}
                value={`${battery.charge}%`}
                sub={battery.power > IDLE_W ? `+${fmtPower(battery.power)}` : battery.power < -IDLE_W ? `−${fmtPower(battery.power)}` : 'idle'} />
            <style jsx global>{`
                .pflow { position: relative; display: block; width: 100%; max-width: 620px; margin: auto; padding-top: 0.5rem; overflow: visible; }
                .pflow text { text-anchor: middle; font-family: inherit; }
                .pflow text.start { text-anchor: start; }
                .pflow .flow-line .track { fill: none; stroke: var(--line); stroke-width: 3; stroke-linecap: round; }
                .pflow .flow-line.off .track { stroke-dasharray: 1 7; }
                .pflow .flow-line.active.grid .track { stroke: color-mix(in srgb, var(--grid) 35%, var(--line)); }
                .pflow .flow-line.active.battery .track { stroke: color-mix(in srgb, var(--battery) 35%, var(--line)); }
                .pflow .flow-line .dot { filter: drop-shadow(0 0 4px currentColor); }
                .pflow .flow-line.grid .dot { fill: var(--grid); color: var(--grid); }
                .pflow .flow-line.battery .dot { fill: var(--battery); color: var(--battery); }
                .pflow .node .halo { fill: none; stroke: currentColor; stroke-width: 1; opacity: 0.18; }
                .pflow .node .disc { fill: color-mix(in srgb, currentColor 10%, var(--card)); stroke: color-mix(in srgb, currentColor 70%, transparent); stroke-width: 2; }
                .pflow .node.solar { color: var(--solar); }
                .pflow .node.grid { color: var(--grid); }
                .pflow .node.home { color: var(--home); }
                .pflow .node.battery { color: var(--battery); }
                .pflow .node.off { opacity: 0.55; }
                .pflow .node.off svg { filter: grayscale(0.6); }
                .pflow .node.off .disc { stroke-dasharray: 3 4; }
                .pflow .node-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; fill: var(--muted); }
                .pflow .node-label.dim { fill: var(--faint); }
                .pflow .node-value { font-size: 21px; font-weight: 700; fill: var(--text); }
                .pflow .node-sub { font-size: 12px; fill: var(--muted); }
                .pflow .node-label { font-size: 14px; }
                .pflow .node-value { font-size: 25px; }
                .pflow .node-sub { font-size: 14px; }
                .pflow text { text-anchor: middle; font-family: inherit; }
                .pflow text.start { text-anchor: start; }
                .pflow .node-label { font-size: var(--pf-label, 12px); }
                .pflow .node-value { font-size: var(--pf-value, 21px); }
                .pflow .node-sub { font-size: var(--pf-sub, 12px); }
                @media (max-width: 600px) {
                    .pflow { --pf-label: 14px; --pf-value: 25px; --pf-sub: 14px; }
                }
            `}</style>
        </svg>
    )
}

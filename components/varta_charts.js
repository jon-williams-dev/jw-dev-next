// History charts for the /varta dashboard. Client-only (Chart.js needs a canvas).

import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const RANGES = [
    { key: '1h', label: '1 h', refresh: 15000 },
    { key: '6h', label: '6 h', refresh: 15000 },
    { key: '24h', label: '24 h', refresh: 60000 },
    { key: '7d', label: '7 days', refresh: 300000 },
    { key: '30d', label: '30 days', refresh: 300000 },
]
const RANGE_KEY = 'varta:range'

const fmtW = (w) => (Math.abs(w) < 1000 ? `${Math.round(w)} W` : `${(w / 1000).toLocaleString('en-GB', { maximumFractionDigits: 2 })} kW`).replace('-', '−')
const signedW = (w) => `${w > 0 ? '+' : ''}${fmtW(w)}`
const fmtWh = (wh) => `${(wh / 1000).toLocaleString('en-GB', { minimumFractionDigits: wh < 10000 ? 2 : 1, maximumFractionDigits: wh < 10000 ? 2 : 1 })} kWh`
const fmtClock = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const fmtDay = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const fmtWhen = (t, long) => !long ? fmtClock(t) : new Date(t).getHours() + new Date(t).getMinutes() === 0 ? fmtDay(t) : `${fmtDay(t)} ${fmtClock(t)}`
const dayLabel = (key) => new Date(`${key}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })

// Ticks on round local times (…, 15 min, 1 h, 6 h, midnight, …), at most ~7 of them.
const STEPS = [5, 10, 15, 30, 60, 120, 180, 360, 720, 1440, 2880, 10080].map((m) => m * 60000)
function timeTicks(from, to) {
    const step = STEPS.find((s) => (to - from) / s <= 7) || STEPS[STEPS.length - 1]
    const start = new Date(from)
    if (step >= 86400000) start.setHours(0, 0, 0, 0)
    else start.setMinutes(Math.ceil((start.getHours() * 60 + start.getMinutes()) / (step / 60000)) * (step / 60000) - start.getHours() * 60, 0, 0)
    const ticks = []
    for (let t = start.getTime(); t <= to; t += step) if (t >= from) ticks.push({ value: t })
    return ticks
}

// ── theme ────────────────────────────────────────────────────────────────────

// Chart colours come from the page's CSS tokens, re-read when the colour scheme flips.
function useTheme(rootRef) {
    const [scheme, setScheme] = useState(0)
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => setScheme((n) => n + 1)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])
    return useMemo(() => {
        if (typeof window === 'undefined' || !rootRef.current) return null
        const css = getComputedStyle(rootRef.current)
        const v = (name) => css.getPropertyValue(name).trim()
        return {
            battery: v('--c-battery'), grid: v('--c-grid'),
            text: v('--text'), muted: v('--muted'), line: v('--line'), zero: v('--faint'), card: v('--card'),
            font: css.fontFamily,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheme, rootRef.current])
}

const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0')

// ── chart plugins ────────────────────────────────────────────────────────────

// Vertical hairline that follows the hovered x position.
const crosshair = {
    id: 'crosshair',
    afterDatasetsDraw(chart, _args, opts) {
        const active = chart.tooltip?.getActiveElements?.()
        if (!active?.length) return
        const { ctx, chartArea } = chart
        const x = active[0].element.x
        ctx.save()
        ctx.strokeStyle = opts.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, chartArea.top)
        ctx.lineTo(x, chartArea.bottom)
        ctx.stroke()
        ctx.restore()
    },
}

// A ringed dot on each line's latest point; the legend above carries the latest values.
const endLabels = {
    id: 'endLabels',
    afterDatasetsDraw(chart, _args, opts) {
        if (!opts.enabled) return
        const { ctx } = chart
        const labels = []
        chart.data.datasets.forEach((ds, i) => {
            const meta = chart.getDatasetMeta(i)
            if (meta.hidden) return
            for (let j = ds.data.length - 1; j >= 0; j--) {
                if (ds.data[j].y == null) continue
                const el = meta.data[j]
                labels.push({ x: el.x, y: el.y, color: ds.borderColor })
                break
            }
        })
        ctx.save()
        for (const l of labels) {
            ctx.fillStyle = opts.ring
            ctx.beginPath(); ctx.arc(l.x, l.y, 6, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = l.color
            ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2); ctx.fill()
        }
        ctx.restore()
    },
}

ChartJS.register(crosshair, endLabels)

function baseOptions(theme, { from, to, long }) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { right: 8 } },
        scales: {
            x: {
                type: 'linear', min: from, max: to,
                grid: { color: theme.line, drawBorder: false, tickLength: 0 },
                ticks: { color: theme.muted, padding: 8, font: { family: theme.font, size: 11 }, callback: (v) => fmtWhen(v, long) },
                afterBuildTicks: (axis) => { axis.ticks = timeTicks(from, to) },
            },
        },
        plugins: {
            legend: { display: false },
            crosshair: { color: theme.muted },
            endLabels: { enabled: false },
            tooltip: {
                backgroundColor: theme.card, borderColor: theme.line, borderWidth: 1,
                titleColor: theme.muted, bodyColor: theme.text, padding: 10, cornerRadius: 10, boxPadding: 4,
                titleFont: { family: theme.font, weight: '500', size: 12 }, bodyFont: { family: theme.font, weight: '600', size: 13 },
                usePointStyle: true,
                callbacks: { title: (items) => items.length ? fmtWhen(items[0].parsed.x, true) : '' },
            },
        },
    }
}

// Short line key, as in the tooltip spec.
const lineKey = (color) => ({ pointStyle: 'line', pointBackgroundColor: color })

// ── pieces ───────────────────────────────────────────────────────────────────

function LegendRow({ items }) {
    return (
        <div className="chart-legend">
            {items.map((i) => (
                <span key={i.label}><i className={i.kind === 'bar' ? 'key-bar' : 'key-line'} style={{ background: i.color, opacity: i.faded ? 0.55 : 1 }} />{i.label}{i.value && <b>{i.value}</b>}</span>
            ))}
        </div>
    )
}

function TableView({ head, rows }) {
    return (
        <details className="table-view">
            <summary>Show data table</summary>
            <div className="table-scroll">
                <table>
                    <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                </table>
            </div>
        </details>
    )
}

function Tile({ label, value, note }) {
    return (
        <div className="h-tile">
            <div className="stat-label">{label}</div>
            <div className="h-tile-value">{value}</div>
            {note && <div className="stat-note">{note}</div>}
        </div>
    )
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function VartaCharts() {
    const rootRef = useRef(null)
    const [range, setRange] = useState('24h')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [mounted, setMounted] = useState(false)
    const theme = useTheme(rootRef)

    useEffect(() => {
        setMounted(true)
        try { const saved = localStorage.getItem(RANGE_KEY); if (RANGES.some((r) => r.key === saved)) setRange(saved) } catch { }
    }, [])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            if (document.hidden) return
            setLoading(true)
            try {
                const res = await fetch(`/api/varta/history?range=${range}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
                if (!res.ok) throw new Error(`History unavailable (${res.status})`)
                const body = await res.json()
                if (!cancelled) { setData(body); setError(null) }
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        const id = setInterval(load, RANGES.find((r) => r.key === range).refresh)
        return () => { cancelled = true; clearInterval(id) }
    }, [range])

    const pick = (key) => {
        setRange(key)
        try { localStorage.setItem(RANGE_KEY, key) } catch { }
    }

    const long = data && data.to - data.from > 86400000
    const filled = data ? data.points.filter((p) => p[1] != null) : []
    const latest = filled[filled.length - 1]
    const enough = data && data.samples >= 2
    const show = mounted && theme && data && data.range === range

    const socData = show && {
        datasets: [{
            label: 'Charge', data: data.points.map(([x, soc]) => ({ x, y: soc })),
            borderColor: theme.battery, backgroundColor: alpha(theme.battery, 0.1), fill: 'origin',
            borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: theme.card,
            tension: 0.25, spanGaps: false, ...lineKey(theme.battery),
        }],
    }
    const socOptions = show && (() => {
        const o = baseOptions(theme, { from: data.from, to: data.to, long })
        o.scales.y = {
            min: 0, max: 100,
            grid: { color: theme.line, drawBorder: false, tickLength: 0 },
            ticks: { color: theme.muted, stepSize: 25, padding: 8, font: { family: theme.font, size: 11 }, callback: (v) => `${v}%` },
        }
        o.plugins.tooltip.callbacks.label = (c) => ` ${c.parsed.y}% charged`
        return o
    })()

    const powerData = show && {
        datasets: [
            {
                label: 'Battery', data: data.points.map(([x, , bp]) => ({ x, y: bp })),
                borderColor: theme.battery, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5,
                pointHoverBorderWidth: 2, pointHoverBorderColor: theme.card, tension: 0.2, spanGaps: false, ...lineKey(theme.battery),
            },
            {
                label: 'Grid', data: data.points.map(([x, , , gp]) => ({ x, y: gp })),
                borderColor: theme.grid, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5,
                pointHoverBorderWidth: 2, pointHoverBorderColor: theme.card, tension: 0.2, spanGaps: false, ...lineKey(theme.grid),
            },
        ],
    }
    const powerOptions = show && (() => {
        const o = baseOptions(theme, { from: data.from, to: data.to, long })
        o.layout.padding.right = 10
        o.scales.y = {
            grace: '10%',
            grid: { drawBorder: false, tickLength: 0, color: (c) => (c.tick.value === 0 ? theme.zero : theme.line), lineWidth: (c) => (c.tick.value === 0 ? 1.5 : 1) },
            ticks: { color: theme.muted, maxTicksLimit: 6, padding: 8, font: { family: theme.font, size: 11 }, callback: (v) => fmtW(v) },
        }
        o.plugins.tooltip.callbacks.label = (c) => {
            const v = c.parsed.y
            const dir = c.dataset.label === 'Battery' ? (v > 0 ? 'charging' : v < 0 ? 'discharging' : 'idle') : (v > 0 ? 'importing' : v < 0 ? 'exporting' : 'balanced')
            return ` ${fmtW(Math.abs(v))}  ${c.dataset.label} ${dir}`
        }
        o.plugins.endLabels = { enabled: true, ring: theme.card }
        return o
    })()

    const dailyChart = (kind) => {
        if (!show || !data.days.length) return null
        const [inKey, outKey, inLabel, outLabel, color] = kind === 'battery'
            ? ['chargedWh', 'dischargedWh', 'Charged', 'Discharged', theme.battery]
            : ['importWh', 'exportWh', 'Imported', 'Exported', theme.grid]
        const chartData = {
            labels: data.days.map((d) => dayLabel(d.date)),
            datasets: [
                { label: inLabel, data: data.days.map((d) => d[inKey] / 1000), backgroundColor: color, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 24 },
                { label: outLabel, data: data.days.map((d) => -d[outKey] / 1000), backgroundColor: alpha(color, 0.55), borderRadius: 4, borderSkipped: 'start', maxBarThickness: 24 },
            ],
        }
        const o = baseOptions(theme, { from: 0, to: 0, long: true })
        o.interaction = { mode: 'index', intersect: false }
        o.plugins.crosshair = { color: 'transparent' }
        o.scales.x = {
            type: 'category', stacked: true, grid: { display: false, drawBorder: false },
            ticks: { color: theme.muted, font: { family: theme.font, size: 11 }, maxRotation: 0, autoSkip: true },
        }
        o.scales.y = {
            stacked: true, grace: '10%',
            grid: { drawBorder: false, tickLength: 0, color: (c) => (c.tick.value === 0 ? theme.zero : theme.line) },
            ticks: { color: theme.muted, maxTicksLimit: 5, padding: 8, font: { family: theme.font, size: 11 }, callback: (v) => `${Math.abs(v).toLocaleString('en-GB', { maximumFractionDigits: 1 })} kWh` },
        }
        o.plugins.tooltip.callbacks.title = (items) => {
            const d = data.days[items[0].dataIndex]
            return `${new Date(`${d.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${d.coverage < 0.95 ? ` · ${Math.round(d.coverage * 100)}% recorded` : ''}`
        }
        o.plugins.tooltip.callbacks.label = (c) => ` ${fmtWh(Math.abs(c.parsed.y) * 1000)}  ${c.dataset.label}`
        return { chartData, options: o, color, inLabel, outLabel }
    }
    const dailyBattery = dailyChart('battery')
    const dailyGrid = dailyChart('grid')

    const totals = data?.totals
    const coverage = data ? Math.round((data.totals.coveredMs / (data.to - data.from)) * 100) : 0

    return (
        <section className="history" ref={rootRef}>
            <div className="history-head">
                <div>
                    <h2 className="section-title">History</h2>
                    <p className="muted">
                        {data?.since ? `Recording since ${fmtDay(data.since)} ${fmtClock(data.since)} · every ${data.sampleMs / 1000} s` : 'Recording starts with the first reading'}
                    </p>
                </div>
                <div className="segmented" role="tablist" aria-label="Time range">
                    {RANGES.map((r) => (
                        <button key={r.key} role="tab" aria-selected={range === r.key} className={range === r.key ? 'on' : ''} onClick={() => pick(r.key)}>{r.label}</button>
                    ))}
                </div>
            </div>

            {error && !data && <div className="card notice"><p>{error}</p></div>}

            {data && (
                <div className={`history-body ${loading ? 'is-loading' : ''}`}>
                    <div className="h-tiles">
                        <Tile label="Battery charged" value={fmtWh(totals.chargedWh)} />
                        <Tile label="Battery discharged" value={fmtWh(totals.dischargedWh)} />
                        <Tile label="Grid import" value={fmtWh(totals.importWh)} />
                        <Tile label="Grid export" value={fmtWh(totals.exportWh)} note={`${coverage}% of this range recorded`} />
                    </div>

                    {!enough && (
                        <div className="card notice slim">
                            <p>Collecting the first readings. The charts fill in every {data.sampleMs / 1000} seconds while the server runs.</p>
                        </div>
                    )}

                    {enough && show && (
                        <div className="charts">
                            <div className="card chart-card">
                                <div className="card-head"><h2>Battery charge</h2></div>
                                <div className="chart-box"><Line data={socData} options={socOptions} /></div>
                                <TableView head={['Time', 'Charge']} rows={filled.slice().reverse().map(([t, soc]) => [fmtWhen(t, long), `${soc}%`])} />
                            </div>

                            <div className="card chart-card">
                                <div className="card-head">
                                    <h2>Power</h2>
                                    <LegendRow items={[
                                        { label: 'Battery (+ charging)', color: theme.battery, value: latest && signedW(latest[2]) },
                                        { label: 'Grid (+ import)', color: theme.grid, value: latest && signedW(latest[3]) },
                                    ]} />
                                </div>
                                <div className="chart-box"><Line data={powerData} options={powerOptions} /></div>
                                <TableView head={['Time', 'Battery', 'Grid']} rows={filled.slice().reverse().map(([t, , bp, gp]) => [fmtWhen(t, long), fmtW(bp), fmtW(gp)])} />
                            </div>

                            {[dailyBattery, dailyGrid].filter(Boolean).map((c) => (
                                <div className="card chart-card" key={c.inLabel}>
                                    <div className="card-head">
                                        <h2>Daily {c.inLabel === 'Charged' ? 'battery' : 'grid'} energy</h2>
                                        <LegendRow items={[{ label: `${c.inLabel} ↑`, color: c.color, kind: 'bar' }, { label: `${c.outLabel} ↓`, color: c.color, kind: 'bar', faded: true }]} />
                                    </div>
                                    <div className="chart-box"><Bar data={c.chartData} options={c.options} /></div>
                                    <TableView head={['Day', c.inLabel, c.outLabel, 'Recorded']}
                                        rows={data.days.slice().reverse().map((d) => [dayLabel(d.date),
                                            fmtWh(c.inLabel === 'Charged' ? d.chargedWh : d.importWh),
                                            fmtWh(c.inLabel === 'Charged' ? d.dischargedWh : d.exportWh),
                                            `${Math.round(d.coverage * 100)}%`])} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

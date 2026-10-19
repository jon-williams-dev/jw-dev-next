// History for the /varta dashboard.
//
// While the server runs, a collector samples the battery every SAMPLE_MS and
// appends one JSON line per sample to data/varta/YYYY-MM-DD.jsonl (local date):
//   { "t": 1792431777000, "soc": 86, "bp": -393, "gp": -7, "ct": 7874223 }
//   t  ms since epoch · soc % · bp battery W (+ charge) · gp grid W (+ import)
//   ct lifetime charged energy counter, Wh
// No database: the files are small (~0.5 MB/day) and easy to inspect or delete.

import fs from 'node:fs/promises'
import path from 'node:path'
import { getVartaStatus, vartaConfig } from './varta'

export const SAMPLE_MS = 10000
const MAX_GAP_MS = 60000       // longer gaps aren't integrated into energy totals
const DIR = path.join(process.cwd(), 'data', 'varta')
const DAY_MS = 86400000

export const RANGES = {
    '1h': 3600000,
    '6h': 6 * 3600000,
    '24h': DAY_MS,
    '7d': 7 * DAY_MS,
    '30d': 30 * DAY_MS,
}
const TARGET_POINTS = 360

const dayKey = (t) => new Date(t).toLocaleDateString('sv-SE')   // YYYY-MM-DD, local time
const fileFor = (key) => path.join(DIR, `${key}.jsonl`)

// ── collector ────────────────────────────────────────────────────────────────

// One collector per server process, surviving dev hot reloads.
export function startCollector() {
    if (!vartaConfig() || globalThis.__vartaCollector) return
    const tick = async () => {
        try {
            const { battery, grid } = await getVartaStatus()
            const t = Date.now()
            const line = JSON.stringify({ t, soc: battery.charge, bp: battery.power, gp: grid.power, ct: battery.chargedTotalWh })
            await fs.mkdir(DIR, { recursive: true })
            await fs.appendFile(fileFor(dayKey(t)), line + '\n')
        } catch (err) {
            // A missed sample just leaves a gap in the charts.
            console.warn('Varta history sample failed:', err.message)
        }
    }
    globalThis.__vartaCollector = setInterval(tick, SAMPLE_MS)
    tick()
}

// ── reading ──────────────────────────────────────────────────────────────────

const pastDays = new Map()   // finished days don't change, so parse them once

async function readDay(key) {
    if (key !== dayKey(Date.now()) && pastDays.has(key)) return pastDays.get(key)
    let samples = []
    try {
        const text = await fs.readFile(fileFor(key), 'utf8')
        for (const line of text.split('\n')) {
            if (!line) continue
            try { samples.push(JSON.parse(line)) } catch { /* skip a torn last line */ }
        }
    } catch (err) {
        if (err.code !== 'ENOENT') throw err
    }
    samples.sort((a, b) => a.t - b.t)
    if (key !== dayKey(Date.now())) pastDays.set(key, samples)
    return samples
}

async function readRange(from, to) {
    const keys = []
    for (let d = new Date(from); d.getTime() <= to; d.setDate(d.getDate() + 1)) keys.push(dayKey(d))
    if (!keys.includes(dayKey(to))) keys.push(dayKey(to))
    const days = await Promise.all(keys.map(readDay))
    return days.flat().filter((s) => s.t >= from && s.t <= to)
}

async function firstSample() {
    try {
        const files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.jsonl')).sort()
        if (!files.length) return null
        return (await readDay(files[0].replace('.jsonl', '')))[0]?.t ?? null
    } catch {
        return null
    }
}

// ── aggregation ──────────────────────────────────────────────────────────────

// Energy (Wh) split by direction, integrating power between consecutive samples.
function energy(samples) {
    const e = { chargedWh: 0, dischargedWh: 0, importWh: 0, exportWh: 0, coveredMs: 0 }
    for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1]
        const dt = samples[i].t - a.t
        if (dt <= 0 || dt > MAX_GAP_MS) continue
        const h = dt / 3600000
        if (a.bp > 0) e.chargedWh += a.bp * h; else e.dischargedWh -= a.bp * h
        if (a.gp > 0) e.importWh += a.gp * h; else e.exportWh -= a.gp * h
        e.coveredMs += dt
    }
    // The battery's own counter is exact for charged energy; prefer it when it moved.
    const counted = samples.length > 1 ? samples[samples.length - 1].ct - samples[0].ct : 0
    if (counted > 0) e.chargedWh = counted
    for (const k of ['chargedWh', 'dischargedWh', 'importWh', 'exportWh']) e[k] = Math.round(e[k])
    return e
}

// Averages power and takes the last charge level per time bucket; empty buckets stay null.
function bucket(samples, from, to) {
    const size = Math.max(SAMPLE_MS, Math.ceil((to - from) / TARGET_POINTS / SAMPLE_MS) * SAMPLE_MS)
    const n = Math.ceil((to - from) / size)
    const acc = Array.from({ length: n }, () => ({ bp: 0, gp: 0, k: 0, soc: null }))
    for (const s of samples) {
        const i = Math.min(n - 1, Math.floor((s.t - from) / size))
        acc[i].bp += s.bp
        acc[i].gp += s.gp
        acc[i].soc = s.soc
        acc[i].k++
    }
    return {
        bucketMs: size,
        points: acc.map((b, i) => b.k
            ? [from + i * size + size / 2, b.soc, Math.round(b.bp / b.k), Math.round(b.gp / b.k)]
            : [from + i * size + size / 2, null, null, null]),
    }
}

export async function getHistory(range) {
    const span = RANGES[range]
    const to = Date.now()
    const from = to - span
    const samples = await readRange(from, to)

    // Daily totals for every calendar day touching the range.
    const days = []
    if (span >= DAY_MS) {
        const byDay = new Map()
        for (const s of samples) {
            const k = dayKey(s.t)
            if (!byDay.has(k)) byDay.set(k, [])
            byDay.get(k).push(s)
        }
        for (const d = new Date(from); d.getTime() <= to; d.setDate(d.getDate() + 1)) {
            const k = dayKey(d)
            const daySamples = k === dayKey(from) ? await readDay(k) : byDay.get(k) || []
            const e = energy(daySamples)
            days.push({ date: k, ...e, coverage: Math.min(1, e.coveredMs / DAY_MS) })
        }
    }

    return {
        range,
        from,
        to,
        sampleMs: SAMPLE_MS,
        since: await firstSample(),
        samples: samples.length,
        ...bucket(samples, from, to),
        totals: energy(samples),
        days,
    }
}

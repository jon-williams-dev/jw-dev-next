// JW Overlap Chart (/jw-overlap): projects of items drawn as circles on one date line.
// Plain data and pure functions, so the page stays about the drawing and the forms.
//
// Dates are YYYY-MM-DD strings, treated as points in time at midnight UTC: an item from
// 1 to 11 June spans 10 days, and its circle runs from the 1 June tick to the 11 June tick.

export const PROJECT_STATUSES = ['Planned', 'Active', 'On hold', 'Completed', 'Cancelled']
export const ITEM_STATES = ['Pending', 'In progress', 'Blocked', 'Done', 'Cancelled']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
export const COLOURS = ['#2f6fed', '#e8590c', '#2b8a3e', '#c2255c', '#7048e8', '#0c8599', '#e67700', '#495057']

const DAY_MS = 864e5
const DATE = /^\d{4}-\d{2}-\d{2}$/

// ── dates ────────────────────────────────────────────────────────────────────

export const isDate = (s) => DATE.test(s || '') && !Number.isNaN(Date.parse(`${s}T00:00:00Z`))
export const toMs = (s) => Date.parse(`${s}T00:00:00Z`)
export const fromMs = (ms) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (s, n) => fromMs(toMs(s) + n * DAY_MS)
export const daysBetween = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY_MS)

const fmt = (s, options) => new Date(toMs(s)).toLocaleDateString('en-GB', { timeZone: 'UTC', ...options })
export const fmtDate = (s) => fmt(s, { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtShort = (s) => fmt(s, { day: 'numeric', month: 'short' })
export const fmtMonth = (s) => fmt(s, { month: 'short', year: 'numeric' })

// "1 Jun – 11 Jun 2026", with the year only once when both dates share it.
export function fmtRange(a, b) {
    return a.slice(0, 4) === b.slice(0, 4) ? `${fmtShort(a)} – ${fmtDate(b)}` : `${fmtDate(a)} – ${fmtDate(b)}`
}

export const fmtDuration = (a, b) => {
    const n = daysBetween(a, b)
    return `${n} day${n === 1 ? '' : 's'}`
}

// ── fields ───────────────────────────────────────────────────────────────────

export const parseTags = (text) => [...new Set(String(text || '').split(',').map((t) => t.trim()).filter(Boolean))]

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

export function blankProject(today) {
    return {
        id: newId(), name: '', description: '', start: today, end: addDays(today, 28), owner: '',
        status: 'Planned', progress: 0, priority: 'Medium', tags: [], notes: '', links: [], items: [],
    }
}

export function blankItem(project) {
    const used = new Set(project.items.map((i) => i.colour))
    const end = addDays(project.start, Math.min(7, daysBetween(project.start, project.end)))
    return {
        id: newId(), name: '', description: '', start: project.start, end, owner: '',
        state: 'Pending', colour: COLOURS.find((c) => !used.has(c)) || COLOURS[project.items.length % COLOURS.length],
        progress: 0, priority: 'Medium', tags: [], notes: '', links: [], dependsOn: [],
    }
}

// ── progress ─────────────────────────────────────────────────────────────────

// A project's progress, from its items: their progress averaged by duration, so a 10-day job
// counts five times a 2-day one. Cancelled items don't count.
export function projectProgress(project) {
    const live = project.items.filter((i) => i.state !== 'Cancelled')
    const days = live.reduce((sum, i) => sum + daysBetween(i.start, i.end), 0)
    if (!days) return 0
    return Math.round(live.reduce((sum, i) => sum + i.progress * daysBetween(i.start, i.end), 0) / days)
}

// An item's state and progress follow each other: Done is 100% and Pending is 0%, and the other way
// round 100% is Done and anything started is In progress. Blocked and Cancelled stay as chosen.
export function withState(item, state) {
    const progress = state === 'Done' ? 100 : state === 'Pending' ? 0 : item.progress
    return { ...item, state, progress }
}

export function withProgress(item, progress) {
    let state = item.state
    if (state !== 'Cancelled' && progress === 100) state = 'Done'
    else if (state === 'Done' || (state === 'Pending' && progress > 0)) state = 'In progress'
    else if (state === 'In progress' && progress === 0) state = 'Pending'
    return { ...item, progress, state }
}

// ── validation ───────────────────────────────────────────────────────────────
// Each returns { field: message } for the form; empty when everything is fine.

function common(v) {
    const errors = linkErrors(v)
    if (!v.name?.trim()) errors.name = 'Give it a name.'
    if (!isDate(v.start)) errors.start = 'Pick a start date.'
    if (!isDate(v.end)) errors.end = 'Pick an end date.'
    else if (isDate(v.start) && toMs(v.end) <= toMs(v.start)) errors.end = 'The end date must be after the start date.'
    const p = Number(v.progress)
    if (!Number.isFinite(p) || p < 0 || p > 100) errors.progress = 'Progress is a percentage from 0 to 100.'
    return errors
}

export function validateProject(project) {
    const errors = common(project)
    if (errors.start || errors.end) return errors
    const outside = project.items.filter((i) => toMs(i.start) < toMs(project.start) || toMs(i.end) > toMs(project.end))
    if (outside.length) {
        const names = outside.map((i) => `${i.name} (${fmtRange(i.start, i.end)})`).join(', ')
        errors.dates = `These dates would leave ${outside.length === 1 ? 'an item' : `${outside.length} items`} outside the project: ${names}. Move or shorten ${outside.length === 1 ? 'it' : 'them'} first, or widen the project.`
    }
    return errors
}

export function validateItem(item, project) {
    const errors = common(item)
    if (item.dependsOn.includes(item.id)) errors.dependsOn = 'An item can’t depend on itself.'
    else if (dependencyCycle(item, project)) errors.dependsOn = 'That would make the dependencies go round in a circle.'
    return errors
}

// ── links ──────────────────────────────────────────────────────────────────────

// What was typed, as a full address: "example.com/x" gets https:// in front.
export const fullUrl = (text) => {
    const t = String(text || '').trim()
    return !t || /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`
}

// Strict on purpose: browsers will happily turn "not a link" into a URL.
const isWebUrl = (url) => {
    if (/\s/.test(url)) return false
    try {
        const u = new URL(url)
        return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.')
    } catch { return false }
}

function linkErrors(value) {
    const bad = (value.links || []).findIndex((url) => !isWebUrl(url))
    return bad < 0 ? {} : { links: `Link ${bad + 1} isn’t a web address.` }
}

// A link short enough to read: the site, and the end of the path if there is one.
//   https://www.amazon.de/Some-Long-Name/dp/B0C9X7/ref=sr_1  ->  amazon.de/…/ref=sr_1
export function shortUrl(url, max = 32) {
    let u
    try { u = new URL(url) } catch { return url.length > max ? `${url.slice(0, max - 1)}…` : url }
    const host = u.hostname.replace(/^www\./, '')
    const parts = u.pathname.split('/').filter(Boolean)
    const last = parts.length ? decodeURIComponent(parts[parts.length - 1]) : ''
    const text = !last ? host : `${host}/${parts.length > 1 ? '…/' : ''}${last}`
    return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

// The project, stretched if need be to take in the item's dates: an item outside it widens it.
export function widenedFor(project, item) {
    return {
        ...project,
        start: toMs(item.start) < toMs(project.start) ? item.start : project.start,
        end: toMs(item.end) > toMs(project.end) ? item.end : project.end,
    }
}

// The item moved in the running order, keeping its length: straight after `prev` (starting as it
// ends), or, at the top with no prev, straight before `next` (ending as it starts).
export function sequenced(item, prev, next) {
    const length = daysBetween(item.start, item.end)
    if (prev) return { ...item, start: prev.end, end: addDays(prev.end, length) }
    return { ...item, start: addDays(next.start, -length), end: next.start }
}

// Whether `item` (with its new dependsOn) can reach itself through the project's dependencies.
function dependencyCycle(item, project) {
    const deps = new Map(project.items.map((i) => [i.id, i.dependsOn]))
    deps.set(item.id, item.dependsOn)
    const seen = new Set()
    const stack = [...item.dependsOn]
    while (stack.length) {
        const id = stack.pop()
        if (id === item.id) return true
        if (seen.has(id)) continue
        seen.add(id)
        stack.push(...(deps.get(id) || []))
    }
    return false
}

// Dependencies that finish after this item starts: allowed, but worth pointing out.
export function lateDependencies(item, project) {
    return project.items.filter((d) => item.dependsOn.includes(d.id) && toMs(d.end) > toMs(item.start))
}

// ── geometry ─────────────────────────────────────────────────────────────────

// One linear scale for the project: the circle's left edge is its start, its right edge its end,
// so its diameter is the distance between them and its centre is halfway.
export function circleFor(item, project, x0, pxPerDay) {
    const left = x0 + daysBetween(project.start, item.start) * pxPerDay
    const right = x0 + daysBetween(project.start, item.end) * pxPerDay
    return { cx: (left + right) / 2, r: (right - left) / 2, left, right }
}

// New dates for an item moved (both ends) or resized ('start' or 'end') by `days`, kept inside the
// project and at least a day long.
export function nudged(project, item, mode, days) {
    const total = daysBetween(project.start, project.end)
    let s = daysBetween(project.start, item.start)
    let e = daysBetween(project.start, item.end)
    if (mode === 'move') {
        const k = Math.min(Math.max(days, -s), total - e)
        s += k
        e += k
    } else if (mode === 'start') s = Math.min(Math.max(s + days, 0), e - 1)
    else e = Math.max(Math.min(e + days, total), s + 1)
    return { start: addDays(project.start, s), end: addDays(project.start, e) }
}

// Days two items share: 0 when apart.
export const sharedDays = (a, b) => Math.max(0, Math.min(daysBetween(a.start, b.end), daysBetween(b.start, a.end), daysBetween(a.start, a.end), daysBetween(b.start, b.end)))

export const contains = (outer, inner) => toMs(outer.start) <= toMs(inner.start) && toMs(outer.end) >= toMs(inner.end)

// The day with the most items running at once (cancelled ones don't count).
export function busiest(project) {
    const live = project.items.filter((i) => i.state !== 'Cancelled')
    let best = { count: 0, date: null }
    for (let d = 0; d < daysBetween(project.start, project.end); d++) {
        const date = addDays(project.start, d)
        const count = live.filter((i) => toMs(i.start) <= toMs(date) && toMs(i.end) > toMs(date)).length
        if (count > best.count) best = { count, date }
    }
    return best
}

// Ticks at least `minGap` px apart: every 1, 2, 3, 7 or 14 days, or on the 1st of every 1–12 months.
export function ticksFor(project, pxPerDay, minGap = 56) {
    const total = daysBetween(project.start, project.end)
    const step = [1, 2, 3, 7, 14].find((n) => n * pxPerDay >= minGap)
    if (step) {
        const ticks = []
        for (let d = 0; d <= total; d += step) ticks.push({ date: addDays(project.start, d), day: d, label: fmtShort(addDays(project.start, d)) })
        return ticks
    }
    const months = [1, 2, 3, 6, 12].find((n) => n * 30.4 * pxPerDay >= minGap) || 12
    const ticks = []
    const s = new Date(toMs(project.start))
    let y = s.getUTCFullYear()
    let m = s.getUTCMonth() + (s.getUTCDate() === 1 ? 0 : 1)
    for (;;) {
        y += Math.floor(m / 12)
        m %= 12
        const date = fromMs(Date.UTC(y, m, 1))
        if (toMs(date) > toMs(project.end)) break
        if (m % months === 0) ticks.push({ date, day: daysBetween(project.start, date), label: fmtMonth(date) })
        m += 1
    }
    return ticks
}

// ── storage ──────────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'jw-overlap:v1'

export function sampleProject() {
    const item = (fields) => ({ description: '', owner: '', progress: 0, priority: 'Medium', tags: [], notes: '', dependsOn: [], ...fields })
    const demo = item({ id: 'sample-demo', name: 'Strip out old kitchen', start: '2026-06-01', end: '2026-06-11', owner: 'Jon', state: 'Done', colour: '#e8590c', progress: 100, priority: 'High', tags: ['building'] })
    const electrics = item({ id: 'sample-electrics', name: 'New electrics and plumbing', start: '2026-06-06', end: '2026-06-16', owner: 'Sparks & Co', state: 'In progress', colour: '#2f6fed', progress: 40, priority: 'High', tags: ['trades'], dependsOn: [demo.id] })
    const inspection = item({ id: 'sample-inspection', name: 'Safety inspection', start: '2026-06-07', end: '2026-06-09', owner: 'Inspector', state: 'Pending', colour: '#2b8a3e', description: 'Sits inside both of the big jobs.' })
    const fit = item({ id: 'sample-fit', name: 'Fit units and paint', start: '2026-06-14', end: '2026-06-21', owner: 'Jon', state: 'Blocked', colour: '#c2255c', notes: 'Waiting on the worktop delivery.', dependsOn: [electrics.id] })
    return {
        id: 'sample', name: 'Kitchen makeover (sample)', description: 'An example to edit or delete: two jobs overlap, and the inspection sits inside both.',
        start: '2026-06-01', end: '2026-06-21', owner: 'Jon', status: 'Active', progress: 48, priority: 'Medium',
        tags: ['home', 'sample'], notes: 'Inspiration: https://example.com/kitchens', items: [demo, electrics, inspection, fit],
    }
}

// The saved projects, or the sample on a first visit.
export function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (saved && Array.isArray(saved.projects)) return saved
    } catch { /* unreadable or blocked: start fresh */ }
    const project = sampleProject()
    return { projects: [project], currentId: project.id }
}

// Returns whether it was saved (private windows and full storage can refuse).
export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        return true
    } catch {
        return false
    }
}

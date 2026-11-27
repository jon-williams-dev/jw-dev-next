// The overlap chart itself: one circle per item on a single date line, left edge = start, right
// edge = end. Used by /jw-overlap (editable) and the hallway screen's /stauperle13/overlap.

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import { addDays, circleFor, contains, daysBetween, fmtDate, fmtDuration, fmtRange, fmtShort, nudged, sharedDays, shortUrl, ticksFor, toMs } from '../lib/overlap'
import styles from '../styles/overlap.module.scss'

const todayLocal = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD

// The items going on today, or failing that, in the next couple of weeks.
function runningAround(items, today) {
    const t = toMs(today), soon = toMs(addDays(today, TODAY_DAYS))
    const on = items.filter((i) => toMs(i.start) <= t && toMs(i.end) >= t)
    return on.length ? on : items.filter((i) => toMs(i.start) <= soon && toMs(i.end) >= t)
}

// The first of the month after `date`'s.
function addMonth(date) {
    const [y, m] = date.split('-').map(Number)
    return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

// Whether today falls inside the project.
function isRunning(project) {
    const today = toMs(todayLocal())
    return today > toMs(project.start) && today < toMs(project.end)
}

const PAD_X = 36
const MIN_WIDTH = 560 // below this the chart scrolls sideways rather than squashing the dates
const LABEL_H = 26
const AXIS_H = 44
const CHAR_W = 7 // rough width of a 13px label character, for collision checks
const MAX_LABEL = 30
const DRAG_PX = 4 // movement before a press counts as a drag rather than a click
const KEYS = { ArrowLeft: -1, ArrowRight: 1 }
const TOOLTIP_NAMES = 4 // overlapping items named in the tooltip before "and N more"
const MAX_PX_PER_DAY = 160 // zooming in stops here
const TYPICAL_D = 64 // a project opens zoomed so its typical item is about this wide
const START_AT = 1 / 3 // ...with today (or the start) this far across the view
const TODAY_DAYS = 14 // ...and, when today is in the project, zoomed in to about this many days around it,
const NOW_SHARE = 0.75 // ...unless that would turn more than a quarter of today's items into ovals
const FADE_R = 90 // items bigger than this (radius, px) fade towards an outline, so the small ones stay readable
const MIN_FILL = 0.08
const RANGE_MARGIN = 16 // px either side of a week or month shown with its button
const MAX_HEIGHT_SHARE = 0.7 // the chart is never taller than this much of the window
const MIN_MAX_HEIGHT = 320
const ZOOM_STEP = 1.5 // each press of + or −
const ZOOM_KEYS = { '+': ZOOM_STEP, '=': ZOOM_STEP, '-': 1 / ZOOM_STEP }
const NAV_H = 54
const NAV_BAND = 36 // the items' band at the top of the navigator; date labels go under it
const NAV_PAD = 8
const NAV_EDGE = 12 // grab zone at each end of the navigator's window
const NAV_MIN_DAYS = 1 // the window can't be squeezed shorter than this

// readOnly: look but don't touch (the hallway screen): a tap shows an item's details instead of
// opening or moving it. fitHeight: squeeze the dates so the biggest circle fits that many pixels.
export default function OverlapChart({ project, active, setActive, onOpen, onChange, readOnly, fitHeight }) {
    const wrapRef = useRef(null)
    const gradientId = useId()
    const [width, setWidth] = useState(0)
    const [drag, setDrag] = useState(null) // { id, mode, x0, origin, start, end, moved }
    const lastPointer = useRef(null) // 'mouse', 'pen' or 'touch'
    const [zoom, setZoom] = useState(1) // 1 = the whole project fits the width
    const [zooming, setZooming] = useState(false) // circles jump rather than glide while zooming
    const [view, setView] = useState(null) // { left, width }: the part of the chart scrolled into view
    const zoomTimer = useRef(null)
    const anchor = useRef(null) // the point to keep still while zooming, applied once the chart redraws
    const [windowH, setWindowH] = useState(0)
    const [pan, setPan] = useState(null) // { x, left } while dragging the view along
    const navRedraw = useRef(null) // the navigator's redraw, for when a zoom moves the view
    const spaceHeld = useRef(false) // Space + drag pans even over circles, which can cover the whole view

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const update = () => setWindowH(window.innerHeight)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    // While dragging, the chart draws the item at its new dates; nothing is saved until release.
    const items = drag ? project.items.map((i) => (i.id === drag.id ? { ...i, start: drag.start, end: drag.end } : i)) : project.items

    const chart = useMemo(() => {
        if (!width) return null
        const days = daysBetween(project.start, project.end)
        let w = Math.max(width, MIN_WIDTH)
        let pxPerDay = (w - PAD_X * 2) / days
        const longest = Math.max(1, ...items.map((i) => daysBetween(i.start, i.end)))
        if (fitHeight) {
            const fits = Math.max(fitHeight - LABEL_H * 2 - 24 - AXIS_H, 120) / longest
            if (fits < pxPerDay) {
                pxPerDay = fits
                w = pxPerDay * days + PAD_X * 2
            }
        }
        // Zoomed in, the dates spread out and the chart scrolls sideways.
        const maxZoom = Math.max(1, MAX_PX_PER_DAY / pxPerDay)
        const z = Math.min(zoom, maxZoom)
        // The zoom a project opens at: enough for a typical (median-length) item to be readable, and
        // in close on the days around today while the project is running, but not so close that most
        // of the items going on now are too big to be circles.
        const spans = project.items.map((i) => daysBetween(i.start, i.end)).sort((a, b) => a - b)
        const typical = spans[Math.floor(spans.length / 2)] || 1
        let forToday = isRunning(project) ? Math.max(width - PAD_X * 2, 1) / (TODAY_DAYS * pxPerDay) : 1
        if (forToday > 1 && windowH && !fitHeight) {
            const room = Math.max(MIN_MAX_HEIGHT, Math.round(windowH * MAX_HEIGHT_SHARE)) - AXIS_H - (LABEL_H + 4) * 2
            const now = runningAround(project.items, todayLocal()).map((i) => daysBetween(i.start, i.end)).sort((a, b) => a - b)
            if (now.length) forToday = Math.max(Math.min(forToday, room / (now[Math.min(Math.floor(now.length * NOW_SHARE), now.length - 1)] * pxPerDay)), 1)
        }
        const autoZoom = Math.min(Math.max(TYPICAL_D / (typical * pxPerDay), forToday, 1), maxZoom)
        // The height suits that view and stays put while zooming and dragging (zoomed further in, the
        // bigger circles are cut off at the top and bottom, their ends still on the centre line). It's
        // never taller than most of the window; the hallway screen sizes its own.
        const longestSaved = Math.max(1, ...project.items.map((i) => daysBetween(i.start, i.end)))
        const tallest = (LABEL_H + 12) * 2 + Math.max(120, longestSaved * pxPerDay * (fitHeight ? 1 : autoZoom)) + AXIS_H
        const h = fitHeight || !windowH ? tallest : Math.min(tallest, Math.max(MIN_MAX_HEIGHT, Math.round(windowH * MAX_HEIGHT_SHARE)))
        pxPerDay *= z
        w = pxPerDay * days + PAD_X * 2
        const circles = items
            .map((item) => ({ item, ...circleFor(item, project, PAD_X, pxPerDay) }))
            .sort((a, b) => b.r - a.r || a.item.id.localeCompare(b.item.id)) // biggest first, so smaller circles sit on top
        sliceTwins(circles, items)
        const axisY = h - AXIS_H
        const cy = axisY / 2
        const weekends = []
        if (pxPerDay >= 8) {
            for (let d = 0; d < days; d++) {
                const day = new Date(toMs(addDays(project.start, d))).getUTCDay()
                if (day === 0 || day === 6) weekends.push(d)
            }
        }
        return {
            w, h, pxPerDay, cy, axisY, circles, weekends, ticks: ticksFor(project, pxPerDay),
            zoom: z, maxZoom, autoZoom, scrolls: w > width + 1,
        }
    }, [project, items, width, fitHeight, zoom, windowH])

    // Fitted to the height: an item too tall for the chart is flattened into an oval exactly as tall
    // as there's room for (its dates, the left and right ends, stay exact); the rest stay circles.
    // `ry` is each one's half-height. Labels go over the part of the chart in view.
    const fitted = useMemo(() => {
        if (!chart) return null
        const left = view?.left ?? 0
        const room = Math.max(chart.cy - LABEL_H - 4, 1)
        const circles = chart.circles.map((c) => ({ ...c, ry: Math.min(c.r, room) }))
        return { circles, labels: placeLabels(circles, chart.cy, chart.w, chart.axisY, [left, left + (view?.width ?? width)]) }
    }, [chart, view, width])

    // Follows the scrolling, a frame at a time.
    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        let frame = 0
        const update = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => setView((v) => (v && v.left === el.scrollLeft && v.width === el.clientWidth ? v : { left: el.scrollLeft, width: el.clientWidth })))
        }
        update()
        el.addEventListener('scroll', update, { passive: true })
        return () => { el.removeEventListener('scroll', update); cancelAnimationFrame(frame) }
    }, [!!chart, width])

    // ── zooming and panning (not on the hallway screen) ──
    // Zooms to `next`, keeping the date under the point vx of the visible box still.
    const zoomTo = (next, vx) => {
        const el = wrapRef.current
        if (!chart || !el || readOnly) return
        const z = Math.min(Math.max(next, 1), chart.maxZoom)
        if (Math.abs(z - chart.zoom) < 0.001) return
        vx ??= el.clientWidth / 2
        anchor.current = { day: (el.scrollLeft + vx - PAD_X) / chart.pxPerDay, vx }
        setZoom(z)
        setZooming(true)
        clearTimeout(zoomTimer.current)
        zoomTimer.current = setTimeout(() => setZooming(false), 250)
    }
    const zoomRef = useRef(zoomTo)
    zoomRef.current = zoomTo

    // Today, this week (Monday to Sunday) or this month, as day offsets from the project start; null
    // when it's outside the project.
    const rangeFor = (which) => {
        const today = todayLocal()
        const weekday = (new Date(toMs(today)).getUTCDay() + 6) % 7 // Monday = 0
        const [from, to] = which === 'week' ? [addDays(today, -weekday), addDays(today, 7 - weekday)]
            : which === 'month' ? [`${today.slice(0, 8)}01`, addMonth(today)] : [today, addDays(today, 1)]
        const total = daysBetween(project.start, project.end)
        const a = Math.max(daysBetween(project.start, from), 0), b = Math.min(daysBetween(project.start, to), total)
        return b > a ? [a, b] : null
    }

    // Today keeps the zoom and glides back to today; week and month zoom to fit them.
    const showRange = (which) => {
        const el = wrapRef.current
        const range = rangeFor(which)
        if (!chart || !el || !range) return
        const [a, b] = range
        if (which === 'today') {
            el.scrollTo({ left: PAD_X + a * chart.pxPerDay - el.clientWidth * START_AT, behavior: 'smooth' })
            return
        }
        const base = chart.pxPerDay / chart.zoom
        const z = Math.min(Math.max((el.clientWidth - RANGE_MARGIN * 2) / ((b - a) * base), 1), chart.maxZoom)
        const mid = { day: (a + b) / 2, vx: el.clientWidth / 2 }
        if (Math.abs(z - chart.zoom) < 0.001) {
            el.scrollTo({ left: PAD_X + mid.day * chart.pxPerDay - mid.vx, behavior: 'smooth' })
            return
        }
        anchor.current = mid
        setZoom(z)
        setZooming(true)
        clearTimeout(zoomTimer.current)
        zoomTimer.current = setTimeout(() => setZooming(false), 250)
    }

    useLayoutEffect(() => {
        const el = wrapRef.current
        const a = anchor.current
        if (!chart || !el || !a) return
        anchor.current = null
        el.scrollLeft = PAD_X + a.day * chart.pxPerDay - a.vx
        navRedraw.current?.()
    }, [chart])

    // Each project opens on a view that suits it (chart.autoZoom), scrolled to today if it's in the project.
    const opened = useRef(null)
    useLayoutEffect(() => {
        const el = wrapRef.current
        if (readOnly || !chart || !el || opened.current === project.id) return
        opened.current = project.id
        const z = chart.autoZoom
        const day = isRunning(project) ? daysBetween(project.start, todayLocal()) : 0
        const vx = day ? el.clientWidth * START_AT : PAD_X
        if (Math.abs(z - chart.zoom) < 0.001) {
            el.scrollLeft = PAD_X + day * chart.pxPerDay - vx
        } else {
            anchor.current = { day, vx }
            setZoom(z)
        }
    }, [chart, project, readOnly])

    // Trackpad pinch (which arrives as Ctrl + wheel) and Ctrl/⌘ + wheel zoom around the pointer;
    // two fingers on a touchscreen pinch-zoom around their midpoint. Both need non-passive listeners.
    useEffect(() => {
        const el = wrapRef.current
        if (!el || readOnly) return
        const local = (x) => x - el.getBoundingClientRect().left
        const onWheel = (e) => {
            if (!e.ctrlKey && !e.metaKey) return
            e.preventDefault()
            const dy = Math.max(-50, Math.min(50, e.deltaY))
            zoomRef.current(currentZoom.current * Math.exp(-dy * 0.01), local(e.clientX))
        }
        let pinch = null
        const spread = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
        const onTouchStart = (e) => {
            if (e.touches.length === 2) pinch = { d: spread(e.touches), z: currentZoom.current }
        }
        const onTouchMove = (e) => {
            if (!pinch || e.touches.length !== 2) return
            e.preventDefault()
            const [a, b] = e.touches
            zoomRef.current(pinch.z * (spread(e.touches) / pinch.d), local((a.clientX + b.clientX) / 2))
        }
        const onTouchEnd = (e) => { if (e.touches.length < 2) pinch = null }
        el.addEventListener('wheel', onWheel, { passive: false })
        el.addEventListener('touchstart', onTouchStart, { passive: true })
        el.addEventListener('touchmove', onTouchMove, { passive: false })
        el.addEventListener('touchend', onTouchEnd)
        el.addEventListener('touchcancel', onTouchEnd)
        return () => {
            el.removeEventListener('wheel', onWheel)
            el.removeEventListener('touchstart', onTouchStart)
            el.removeEventListener('touchmove', onTouchMove)
            el.removeEventListener('touchend', onTouchEnd)
            el.removeEventListener('touchcancel', onTouchEnd)
        }
    }, [readOnly])
    const currentZoom = useRef(1)
    currentZoom.current = chart?.zoom ?? 1

    // With the mouse, dragging the background pans, and so does dragging anywhere with Space held or
    // with the middle button. Circles still move items; touch scrolls natively.
    useEffect(() => {
        if (readOnly) return
        const typing = (e) => e.target.closest?.('input, textarea, select, [contenteditable]')
        const down = (e) => { if (e.key === ' ' && !typing(e) && wrapRef.current?.classList.contains(styles.pannable)) { spaceHeld.current = true; if (!e.target.closest?.('button, [role=button]')) e.preventDefault() } }
        const up = (e) => { if (e.key === ' ') spaceHeld.current = false }
        const reset = () => { spaceHeld.current = false }
        window.addEventListener('keydown', down)
        window.addEventListener('keyup', up)
        window.addEventListener('blur', reset)
        return () => {
            window.removeEventListener('keydown', down)
            window.removeEventListener('keyup', up)
            window.removeEventListener('blur', reset)
        }
    }, [readOnly])

    const panStart = (e) => {
        const el = wrapRef.current
        if (readOnly || e.pointerType !== 'mouse') return
        const anywhere = e.button === 1 || (e.button === 0 && spaceHeld.current)
        if (!anywhere && (e.button !== 0 || e.target.closest('[role=button], [data-handle]'))) return
        if (el.scrollWidth <= el.clientWidth) return
        e.preventDefault() // no middle-click autoscroll
        e.currentTarget.setPointerCapture(e.pointerId)
        setPan({ x: e.clientX, left: el.scrollLeft })
    }
    const panMove = (e) => {
        if (!pan) return
        wrapRef.current.scrollLeft = pan.left - (e.clientX - pan.x)
    }

    // + and − zoom and 0 fits, from anywhere in the chart (the circles pass these keys on).
    const onZoomKey = (e) => {
        if (readOnly || e.ctrlKey || e.metaKey || e.altKey) return
        if (ZOOM_KEYS[e.key]) { e.preventDefault(); zoomTo(chart.zoom * ZOOM_KEYS[e.key]) }
        else if (e.key === '0') { e.preventDefault(); zoomTo(1) }
    }

    const focusId = drag?.id || active
    const today = todayLocal()
    const todayX = chart && toMs(today) >= toMs(project.start) && toMs(today) <= toMs(project.end)
        ? PAD_X + daysBetween(project.start, today) * chart.pxPerDay : null
    const hiddenLabels = fitted ? fitted.labels.filter((l) => !l.shown && !l.away).length : 0
    const focused = fitted && focusId && fitted.circles.find((c) => c.item.id === focusId)

    // ── dragging: the circle moves the whole item, the side handles move one end ──
    const pressStart = (e, item, mode) => {
        lastPointer.current = e.pointerType
        if (e.button !== 0) return
        // On touch screens a drag on the circle scrolls the chart; only the handles resize.
        if (mode === 'move' && e.pointerType === 'touch') return
        if (spaceHeld.current) return // that's a pan
        e.currentTarget.setPointerCapture(e.pointerId)
        setDrag({ id: item.id, mode, x0: e.clientX, origin: item, start: item.start, end: item.end, moved: false })
        setActive(item.id)
    }
    const pressMove = (e) => {
        if (!drag) return
        const dx = e.clientX - drag.x0
        if (!drag.moved && Math.abs(dx) < DRAG_PX) return
        setDrag({ ...drag, moved: true, ...nudged(project, drag.origin, drag.mode, Math.round(dx / chart.pxPerDay)) })
    }
    const pressEnd = () => {
        if (!drag) return
        const { origin, start, end, moved, mode } = drag
        setDrag(null)
        if (!moved) { if (mode === 'move') onOpen(origin); return }
        if (start !== origin.start || end !== origin.end) onChange({ ...origin, start, end })
    }
    const pressHandlers = (item, mode) => ({
        onPointerDown: (e) => pressStart(e, item, mode),
        onPointerMove: pressMove,
        onPointerUp: pressEnd,
        onPointerCancel: () => setDrag(null),
    })

    // Touch taps on a circle (no drag there) still open the editor.
    const onTap = (e, item) => {
        if (lastPointer.current === 'touch' || e.detail === 0) onOpen(item)
    }

    const onKey = (e, item) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(item)
        } else if (KEYS[e.key]) {
            e.preventDefault()
            const next = nudged(project, item, e.shiftKey ? 'end' : e.altKey ? 'start' : 'move', KEYS[e.key])
            if (next.start !== item.start || next.end !== item.end) onChange({ ...item, ...next })
        }
    }

    const leave = (e, id) => {
        if (drag || e.relatedTarget?.closest?.('[data-handle]')) return
        setActive((a) => (a === id ? null : a))
    }

    return (
        <div className={styles.chartWrap} onKeyDown={onZoomKey}>
            {!readOnly && chart && project.items.length > 0 && (
                <div className={styles.zoomBar} role="group" aria-label="Zoom">
                    <button type="button" onClick={() => zoomTo(chart.zoom / ZOOM_STEP)} disabled={chart.zoom <= 1} aria-label="Zoom out">−</button>
                    <span className={styles.zoomLevel} aria-live="polite">{Math.round(chart.zoom * 100)}%</span>
                    <button type="button" onClick={() => zoomTo(chart.zoom * ZOOM_STEP)} disabled={chart.zoom >= chart.maxZoom - 0.001} aria-label="Zoom in">+</button>
                    {[['today', 'Today'], ['week', 'Week'], ['month', 'Month']].map(([which, label]) => (
                        <button key={which} type="button" onClick={() => showRange(which)} disabled={!rangeFor(which)}
                            title={rangeFor(which) ? undefined : `${label} is outside this project`}>{label}</button>
                    ))}
                    <button type="button" onClick={() => zoomTo(1)} disabled={chart.zoom <= 1}>Fit</button>
                </div>
            )}
            <div ref={wrapRef}
                className={`${styles.chartScroll} ${drag?.moved || pan ? styles.dragging : ''} ${zooming ? styles.zooming : ''} ${chart?.scrolls ? styles.pannable : ''}`}
                onPointerDown={panStart} onPointerMove={panMove} onPointerUp={() => setPan(null)} onPointerCancel={() => setPan(null)}>
                {chart && (
                    <div className={styles.chartInner} style={{ width: chart.w, height: chart.h, margin: readOnly ? '0 auto' : undefined }}>
                        <svg width={chart.w} height={chart.h} role="group" className={focusId ? styles.hasFocus : ''}
                            aria-label={`Timeline from ${fmtDate(project.start)} to ${fmtDate(project.end)}. Each circle is an item${readOnly ? '' : ': Enter edits it, arrow keys move it'}.`}>
                            <defs>
                                {chart.circles.map(({ item, cx, r, slice }) => (
                                    <radialGradient key={item.id} id={`${gradientId}-${item.id}`}
                                        {...(slice ? { gradientUnits: 'userSpaceOnUse', cx, cy: chart.cy - r * 0.16, r: Math.max(r * 1.24, 1) } : { cx: '50%', cy: '42%', r: '62%' })}>
                                        <stop offset="0%" stopColor={item.colour} stopOpacity="0.06" />
                                        <stop offset="100%" stopColor={item.colour} stopOpacity="0.34" />
                                    </radialGradient>
                                ))}
                            </defs>

                            {/* Date grid and axis */}
                            <g aria-hidden="true">
                                {chart.weekends.map((d) => (
                                    <rect key={d} x={PAD_X + d * chart.pxPerDay} y={8} width={chart.pxPerDay} height={chart.axisY - 8} className={styles.weekend} />
                                ))}
                                {chart.ticks.map((t) => {
                                    const x = PAD_X + t.day * chart.pxPerDay
                                    return (
                                        <g key={t.date}>
                                            <line x1={x} x2={x} y1={8} y2={chart.axisY} className={styles.grid} />
                                            <line x1={x} x2={x} y1={chart.axisY} y2={chart.axisY + 6} className={styles.axis} />
                                            <text x={x} y={chart.axisY + 22} textAnchor="middle" className={styles.tick}>{t.label}</text>
                                        </g>
                                    )
                                })}
                                <line x1={PAD_X} x2={chart.w - PAD_X} y1={chart.axisY} y2={chart.axisY} className={styles.axis} />
                                <line x1={PAD_X} x2={chart.w - PAD_X} y1={chart.cy} y2={chart.cy} className={styles.centre} />
                                {todayX !== null && (
                                    <g className={styles.today}>
                                        <line x1={todayX} x2={todayX} y1={8} y2={chart.axisY} />
                                        <rect x={todayX - 22} y={2} width={44} height={18} rx={9} />
                                        <text x={todayX} y={15} textAnchor="middle">Today</text>
                                    </g>
                                )}
                            </g>

                            {/* Items, biggest first, cut off above the date axis */}
                            <clipPath id={`${gradientId}-clip`}><rect x={0} y={0} width={chart.w} height={chart.axisY} /></clipPath>
                            <g clipPath={`url(#${gradientId}-clip)`}>
                                {fitted.circles.map(({ item, cx, r, ry, slice }) => (
                                    <g
                                        key={item.id}
                                        className={`${styles.item} ${focusId === item.id ? styles.itemActive : ''} ${drag?.id === item.id ? styles.itemDragging : ''}`}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${item.name}, ${fmtRange(item.start, item.end)}${slice ? `, same dates as ${slice.count - 1} other item${slice.count > 2 ? 's' : ''}` : ''}, ${item.state}, ${item.progress}% done`}
                                        onClick={readOnly ? () => setActive(item.id) : (e) => onTap(e, item)}
                                        onKeyDown={readOnly ? undefined : (e) => onKey(e, item)}
                                        onMouseEnter={() => !drag && setActive(item.id)}
                                        onMouseLeave={(e) => leave(e, item.id)}
                                        onFocus={() => setActive(item.id)}
                                        onBlur={() => setActive((a) => (a === item.id ? null : a))}
                                        {...(readOnly ? {} : pressHandlers(item, 'move'))}
                                    >
                                        <g style={{ '--fill': Math.min(Math.max(FADE_R / Math.max(ry, 1), MIN_FILL), 1), ...(ry < r ? { transform: `translateY(${chart.cy}px) scaleY(${ry / r}) translateY(${-chart.cy}px)` } : {}) }}>
                                            {slice ? (
                                                <path className={styles.body} d={wedge(cx, chart.cy, Math.max(r, 1), slice)} fill={`url(#${gradientId}-${item.id})`} stroke={item.colour} vectorEffect="non-scaling-stroke"
                                                    strokeLinejoin="round" strokeDasharray={item.state === 'Cancelled' ? '6 5' : undefined} />
                                            ) : (
                                                <circle className={styles.body} cx={cx} cy={chart.cy} r={Math.max(r, 1)} fill={`url(#${gradientId}-${item.id})`} stroke={item.colour} vectorEffect="non-scaling-stroke"
                                                    strokeDasharray={item.state === 'Cancelled' ? '6 5' : undefined} />
                                            )}
                                            {item.progress > 0 && item.state !== 'Cancelled' && (slice ? (
                                                <path className={`${styles.ring} ${styles.ringSlice}`} d={arc(cx, chart.cy, Math.max(r, 1), slice)} stroke={item.colour} pathLength={100} vectorEffect="non-scaling-stroke"
                                                    strokeDasharray={`${item.progress} 100`} />
                                            ) : (
                                                <circle className={styles.ring} cx={cx} cy={chart.cy} r={Math.max(r, 1)} stroke={item.colour} pathLength={100} vectorEffect="non-scaling-stroke"
                                                    strokeDasharray={`${item.progress} 100`} />
                                            ))}
                                        </g>
                                    </g>
                                ))}
                            </g>

                            {/* Labels on top of everything, but not in the way of clicks */}
                            <g aria-hidden="true" pointerEvents="none">
                                {fitted.labels.filter((l) => l.shown).map((l) => (
                                    <text key={l.id} x={l.x} y={l.y} textAnchor="middle" style={{ fill: l.colour }}
                                        className={`${styles.label} ${focusId && focusId !== l.id ? styles.labelDim : ''}`}>{l.text}</text>
                                ))}
                            </g>

                            {focused && <Guides circle={focused} cy={chart.cy} axisY={chart.axisY} width={chart.w} />}

                            {/* Resize handles for the highlighted item */}
                            {focused && !readOnly && (
                                <g data-handle onMouseLeave={(e) => leave(e, focused.item.id)} onMouseEnter={() => setActive(focused.item.id)}>
                                    {[['start', focused.left], ['end', focused.right]].map(([mode, x]) => (
                                        <g key={mode} className={styles.handle} {...pressHandlers(focused.item, mode)}>
                                            <circle cx={x} cy={chart.cy} r={16} className={styles.handleHit} />
                                            <circle cx={x} cy={chart.cy} r={7} stroke={focused.item.colour} />
                                            <path d={`M${x - 2} ${chart.cy - 3}v6M${x + 2} ${chart.cy - 3}v6`} stroke={focused.item.colour} />
                                        </g>
                                    ))}
                                </g>
                            )}
                        </svg>

                        {focused && <Tooltip circle={focused} cy={chart.cy} width={chart.w} height={chart.h} project={project} items={items} dragging={!!drag?.moved} />}
                    </div>
                )}
                {project.items.length === 0 && <p className={styles.chartEmpty}>No items yet. Add one to draw its circle.</p>}
            </div>
            {!readOnly && chart && width > 0 && project.items.length > 0 && (
                <Navigator project={project} items={items} chart={chart} scrollRef={wrapRef} width={width} zoomTo={zoomTo} redrawRef={navRedraw} />
            )}
            {!readOnly && <p className={styles.hint}>
                {hiddenLabels > 0 && <>{hiddenLabels} label{hiddenLabels === 1 ? ' is' : 's are'} hidden to keep the chart readable. </>}
                <span className={styles.pointerHint}>Drag a circle to move it, or its side handles to change the dates. Pinch or <kbd>Ctrl</kbd>+scroll to zoom, and drag the window in the strip underneath to move along the timeline (stretch its ends to zoom). </span>
                <span className={styles.touchHint}>Tap a circle to edit it, then drag its side handles to change the dates. Pinch to zoom, and drag the window in the strip underneath to move along the timeline.</span>
                <span className={styles.pointerHint}>
                    Keyboard: <kbd>←</kbd><kbd>→</kbd> move, <kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> end date, <kbd>Alt</kbd>+<kbd>←</kbd><kbd>→</kbd> start date, <kbd>+</kbd><kbd>−</kbd> zoom, <kbd>0</kbd> fit.
                </span>
            </p>}
        </div>
    )
}

// An overview of the whole project under the chart, with a window over the dates in view: drag the
// window to pan, drag its ends to zoom, press anywhere else on the strip to jump there, and
// double-click to fit everything.
function Navigator({ project, items, chart, scrollRef, width, zoomTo, redrawRef }) {
    const days = daysBetween(project.start, project.end)
    const k = (width - NAV_PAD * 2) / days // strip pixels per day
    const [grab, setGrab] = useState(null) // { mode: 'move' | 'start' | 'end', x, from, to, left }
    const [, redraw] = useReducer((n) => n + 1, 0)

    // The window is worked out from the chart's scroll position on every draw; scrolling redraws it,
    // and so does the chart when a zoom moves the view.
    useEffect(() => {
        const el = scrollRef.current
        redrawRef.current = redraw
        el.addEventListener('scroll', redraw, { passive: true })
        return () => {
            el.removeEventListener('scroll', redraw)
            redrawRef.current = null
        }
    }, [scrollRef, redrawRef])

    const el = scrollRef.current
    if (!el) return null
    const view = { // in days since the start
        from: Math.max(0, (el.scrollLeft - PAD_X) / chart.pxPerDay),
        to: Math.min(days, (el.scrollLeft + el.clientWidth - PAD_X) / chart.pxPerDay),
    }
    const x0 = NAV_PAD + view.from * k
    const x1 = NAV_PAD + view.to * k
    const base = chart.pxPerDay / chart.zoom // pixels per day when everything fits
    const dayAt = (e) => (e.clientX - e.currentTarget.getBoundingClientRect().left - NAV_PAD) / k

    const down = (e) => {
        if (e.button !== 0) return
        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
        let mode = Math.abs(x - x0) <= NAV_EDGE && x < (x0 + x1) / 2 ? 'start' : Math.abs(x - x1) <= NAV_EDGE ? 'end' : 'move'
        if (mode === 'move' && (x < x0 || x > x1)) {
            // Outside the window: centre it there, then carry on dragging it.
            el.scrollLeft = PAD_X + (dayAt(e) - (view.to - view.from) / 2) * chart.pxPerDay
        }
        e.currentTarget.setPointerCapture(e.pointerId)
        setGrab({ mode, x: e.clientX, from: view.from, to: view.to, left: el.scrollLeft })
    }
    const move = (e) => {
        if (!grab) return
        if (grab.mode === 'move') {
            el.scrollLeft = grab.left + ((e.clientX - grab.x) / k) * chart.pxPerDay
        } else if (grab.mode === 'end') {
            const to = Math.min(days, Math.max(grab.from + NAV_MIN_DAYS, dayAt(e)))
            zoomTo(el.clientWidth / ((to - grab.from) * base), 0) // the start stays put
        } else {
            const from = Math.max(0, Math.min(grab.to - NAV_MIN_DAYS, dayAt(e)))
            zoomTo(el.clientWidth / ((grab.to - from) * base), el.clientWidth) // the end stays put
        }
    }

    return (
        <svg className={`${styles.navigator} ${grab ? styles.navigatorGrabbing : ''}`} width={width} height={NAV_H} aria-hidden="true"
            onPointerDown={down} onPointerMove={move} onPointerUp={() => setGrab(null)} onPointerCancel={() => setGrab(null)}
            onDoubleClick={() => zoomTo(1)}>
            <rect x={0} y={0} width={width} height={NAV_H} rx={10} className={styles.navBack} />
            {ticksFor(project, k, 64).map((t) => (
                <g key={t.date}>
                    <line x1={NAV_PAD + t.day * k} x2={NAV_PAD + t.day * k} y1={4} y2={NAV_H - 4} className={styles.grid} />
                    <text x={NAV_PAD + t.day * k + 4} y={NAV_H - 6} className={styles.navTick}>{t.label}</text>
                </g>
            ))}
            {[...items].sort((a, b) => daysBetween(b.start, b.end) - daysBetween(a.start, a.end)).map((item) => {
                const rx = Math.max((daysBetween(item.start, item.end) * k) / 2, 1)
                return (
                    <ellipse key={item.id} cx={NAV_PAD + (daysBetween(project.start, item.start) * k) + rx} cy={NAV_BAND / 2 + 2} rx={rx}
                        ry={Math.min(rx, NAV_BAND / 2 - 4)} fill={item.colour} fillOpacity={0.18} stroke={item.colour} strokeOpacity={0.8} />
                )
            })}
            {/* Everything outside the window is faded */}
            <rect x={0} y={0} width={Math.max(x0, 0)} height={NAV_H} className={styles.navShade} />
            <rect x={x1} y={0} width={Math.max(width - x1, 0)} height={NAV_H} className={styles.navShade} />
            <rect x={x0} y={1} width={Math.max(x1 - x0, 2)} height={NAV_H - 2} rx={8} className={styles.navWindow} />
            {[x0, x1].map((x, i) => <rect key={i} x={x - 3} y={NAV_H / 2 - 9} width={6} height={18} rx={3} className={styles.navGrip} />)}
        </svg>
    )
}

// Items with exactly the same dates would be identical circles, each hiding the ones under it, so
// they share one circle cut into slices instead (clockwise from the top, in list order).
function sliceTwins(circles, items) {
    const order = new Map(items.map((i, n) => [i.id, n]))
    const groups = new Map()
    for (const c of circles) {
        const key = `${c.item.start}|${c.item.end}`
        groups.set(key, [...(groups.get(key) || []), c])
    }
    for (const group of groups.values()) {
        if (group.length < 2) continue
        group.sort((a, b) => order.get(a.item.id) - order.get(b.item.id))
        group.forEach((c, index) => { c.slice = { index, count: group.length } })
    }
}

const sliceAngles = ({ index, count }) => [-Math.PI / 2 + (index / count) * 2 * Math.PI, -Math.PI / 2 + ((index + 1) / count) * 2 * Math.PI]
const onCircle = (cx, cy, r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`

// The slice's outer edge, drawn clockwise, for its progress ring.
function arc(cx, cy, r, slice) {
    const [a0, a1] = sliceAngles(slice)
    return `M${onCircle(cx, cy, r, a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${onCircle(cx, cy, r, a1)}`
}

function wedge(cx, cy, r, slice) {
    return `M${cx} ${cy}L${arc(cx, cy, r, slice).slice(1)}Z`
}

// Puts each label above its circle, or below if that's taken, or hides it if both would collide.
// `seen` is the stretch of the chart in view: an item reaching off the side is labelled over the
// part of it that's showing.
function placeLabels(circles, cy, width, axisY, seen = [0, width]) {
    const boxes = []
    const collides = (b) => boxes.some((o) => b.x1 < o.x2 && b.x2 > o.x1 && b.y1 < o.y2 && b.y2 > o.y1)
    return circles.map(({ item, cx, r, ry = r, left, right, slice }) => {
        if (right <= seen[0] || left >= seen[1]) return { id: item.id, shown: false, away: true }
        const name = item.state === 'Done' ? `✓ ${item.name}` : item.name
        const text = name.length > MAX_LABEL ? `${name.slice(0, MAX_LABEL - 1)}…` : name
        const half = (text.length * CHAR_W) / 2 + 4
        // A slice's label leans towards its side of the circle, and starts below for a bottom slice.
        const [a0, a1] = slice ? sliceAngles(slice) : [0, 0]
        const mid = (a0 + a1) / 2
        const lean = slice && Math.abs(Math.cos(mid)) > 0.2 ? Math.sign(Math.cos(mid)) * (half + 4) : 0
        const from = Math.max(seen[0], 0) + half + 2, to = Math.min(seen[1], width) - half - 2
        const x = Math.min(Math.max(cx + lean, from), to)
        // A circle cut off by the chart's edge gets its label just inside the edge.
        const above = Math.max(cy - ry - 8, 18), below = Math.min(cy + ry + 18, axisY - 6)
        for (const y of slice && Math.sin(mid) > 0.5 ? [below, above] : [above, below]) {
            const box = { x1: x - half, x2: x + half, y1: y - 14, y2: y + 4 }
            if (!collides(box)) {
                boxes.push(box)
                return { id: item.id, text, x, y, colour: item.colour, shown: true }
            }
        }
        return { id: item.id, shown: false }
    })
}

// Dashed lines from the highlighted circle's edges down to its dates on the axis.
function Guides({ circle: { item, left, right }, cy, axisY, width }) {
    const pill = (x, text, anchor) => {
        const w = text.length * 7 + 14
        const x0 = Math.min(Math.max(anchor === 'end' ? x - w + 10 : anchor === 'start' ? x - 10 : x - w / 2, 2), width - w - 2)
        return (
            <g>
                <rect x={x0} y={axisY + 9} width={w} height={20} rx={10} fill={item.colour} />
                <text x={x0 + w / 2} y={axisY + 23} textAnchor="middle">{text}</text>
            </g>
        )
    }
    const close = right - left < 110 // keep the two dates from sitting on top of each other
    return (
        <g className={styles.guides} aria-hidden="true" pointerEvents="none">
            <line x1={left} x2={left} y1={cy} y2={axisY} stroke={item.colour} />
            <line x1={right} x2={right} y1={cy} y2={axisY} stroke={item.colour} />
            {pill(left, fmtShort(item.start), close ? 'end' : 'middle')}
            {pill(right, fmtShort(item.end), close ? 'start' : 'middle')}
        </g>
    )
}

// Names, cut short so a busy chart doesn't make the tooltip taller than the chart.
function Names({ items, note }) {
    const shown = items.slice(0, TOOLTIP_NAMES)
    return (
        <>
            {shown.map((o, i) => (
                <Fragment key={o.id}>{i > 0 && ', '}<b style={{ color: o.colour }}>{o.name}</b>{note && ` (${note(o)})`}</Fragment>
            ))}
            {items.length > shown.length && <> and {items.length - shown.length} more</>}
        </>
    )
}

function Tooltip({ circle: { item, cx, ry }, cy, width, height, project, items, dragging }) {
    const ref = useRef(null)
    const [boxHeight, setBoxHeight] = useState(0)
    useLayoutEffect(() => { setBoxHeight(ref.current.offsetHeight) })

    // Above the circle if it fits, else just inside its top, else as high as the chart allows.
    const top = cy - ry
    const y = top - 14 - boxHeight >= 4 ? top - 14 - boxHeight : Math.max(4, Math.min(top + 14, height - boxHeight - 4))

    const deps = project.items.filter((i) => item.dependsOn.includes(i.id))
    const others = items.filter((o) => o.id !== item.id && sharedDays(item, o) > 0)
    const twins = others.filter((o) => o.start === item.start && o.end === item.end)
    const overlaps = others.filter((o) => !twins.includes(o))
    const overlapNote = (o) => (contains(o, item) ? 'inside it' : contains(item, o) ? 'inside this' : `${sharedDays(item, o)} d`)
    return (
        <div ref={ref} className={`${styles.tooltip} ${dragging ? styles.tooltipLive : ''}`}
            style={{ left: Math.min(Math.max(cx, 140), width - 140), top: y, transform: 'translateX(-50%)', visibility: boxHeight ? undefined : 'hidden' }}>
            <strong><span className={styles.swatch} style={{ background: item.colour }} />{item.name}</strong>
            <span className={styles.tooltipDates}>{fmtRange(item.start, item.end)} · {fmtDuration(item.start, item.end)}</span>
            {!dragging && (
                <>
                    <span><span className={styles.badge} data-tone={item.state}>{item.state}</span> {item.progress}%{item.owner ? ` · ${item.owner}` : ''}</span>
                    {twins.length > 0 && <span className={styles.tooltipList}>Same dates as <Names items={twins} /></span>}
                    {overlaps.length > 0 && <span className={styles.tooltipList}>Overlaps <Names items={overlaps} note={overlapNote} /></span>}
                    {deps.length > 0 && <span className={styles.tooltipList}>After {deps.map((d) => d.name).join(', ')}</span>}
                    {item.links?.length > 0 && <span className={styles.tooltipList}>Links: {item.links.map((url) => shortUrl(url)).join(', ')}</span>}
                </>
            )}
        </div>
    )
}

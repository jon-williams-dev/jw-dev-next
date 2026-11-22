// The overlap chart itself: one circle per item on a single date line, left edge = start, right
// edge = end. Used by /jw-overlap (editable) and the hallway screen's /stauperle13/overlap.

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { addDays, circleFor, contains, daysBetween, fmtDate, fmtDuration, fmtRange, fmtShort, nudged, sharedDays, ticksFor, toMs } from '../lib/overlap'
import styles from '../styles/overlap.module.scss'

const todayLocal = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD
const PAD_X = 36
const MIN_WIDTH = 560 // below this the chart scrolls sideways rather than squashing the dates
const LABEL_H = 26
const AXIS_H = 44
const CHAR_W = 7 // rough width of a 13px label character, for collision checks
const MAX_LABEL = 30
const DRAG_PX = 4 // movement before a press counts as a drag rather than a click
const KEYS = { ArrowLeft: -1, ArrowRight: 1 }
const TOOLTIP_NAMES = 4 // overlapping items named in the tooltip before "and N more"

// readOnly: look but don't touch (the hallway screen): a tap shows an item's details instead of
// opening or moving it. fitHeight: squeeze the dates so the biggest circle fits that many pixels.
export default function OverlapChart({ project, active, setActive, onOpen, onChange, readOnly, fitHeight }) {
    const wrapRef = useRef(null)
    const gradientId = useId()
    const [width, setWidth] = useState(0)
    const [drag, setDrag] = useState(null) // { id, mode, x0, origin, start, end, moved }
    const lastPointer = useRef(null) // 'mouse', 'pen' or 'touch'

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // While dragging, the chart draws the item at its new dates; nothing is saved until release.
    const items = drag ? project.items.map((i) => (i.id === drag.id ? { ...i, start: drag.start, end: drag.end } : i)) : project.items

    const chart = useMemo(() => {
        if (!width) return null
        const days = daysBetween(project.start, project.end)
        let w = Math.max(width, MIN_WIDTH)
        let pxPerDay = (w - PAD_X * 2) / days
        if (fitHeight) {
            const longest = Math.max(1, ...items.map((i) => daysBetween(i.start, i.end)))
            const fits = Math.max(fitHeight - LABEL_H * 2 - 24 - AXIS_H, 120) / longest
            if (fits < pxPerDay) {
                pxPerDay = fits
                w = pxPerDay * days + PAD_X * 2
            }
        }
        const circles = items
            .map((item) => ({ item, ...circleFor(item, project, PAD_X, pxPerDay) }))
            .sort((a, b) => b.r - a.r || a.item.id.localeCompare(b.item.id)) // biggest first, so smaller circles sit on top
        sliceTwins(circles, items)
        const maxD = Math.max(120, ...circles.map((c) => c.r * 2))
        const cy = LABEL_H + 12 + maxD / 2
        const axisY = cy + maxD / 2 + LABEL_H + 12
        const weekends = []
        if (pxPerDay >= 8) {
            for (let d = 0; d < days; d++) {
                const day = new Date(toMs(addDays(project.start, d))).getUTCDay()
                if (day === 0 || day === 6) weekends.push(d)
            }
        }
        return { w, h: axisY + AXIS_H, pxPerDay, cy, axisY, circles, weekends, labels: placeLabels(circles, cy, w), ticks: ticksFor(project, pxPerDay) }
    }, [project, items, width, fitHeight])

    const focusId = drag?.id || active
    const today = todayLocal()
    const todayX = chart && toMs(today) >= toMs(project.start) && toMs(today) <= toMs(project.end)
        ? PAD_X + daysBetween(project.start, today) * chart.pxPerDay : null
    const hiddenLabels = chart ? chart.circles.length - chart.labels.filter((l) => l.shown).length : 0
    const focused = chart && focusId && chart.circles.find((c) => c.item.id === focusId)

    // ── dragging: the circle moves the whole item, the side handles move one end ──
    const pressStart = (e, item, mode) => {
        lastPointer.current = e.pointerType
        if (e.button !== 0) return
        // On touch screens a drag on the circle scrolls the chart; only the handles resize.
        if (mode === 'move' && e.pointerType === 'touch') return
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
        <div className={styles.chartWrap}>
            <div className={`${styles.chartScroll} ${drag?.moved ? styles.dragging : ''}`} ref={wrapRef}>
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

                            {/* Items, biggest first */}
                            {chart.circles.map(({ item, cx, r, slice }) => (
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
                                    {slice ? (
                                        <path className={styles.body} d={wedge(cx, chart.cy, Math.max(r, 1), slice)} fill={`url(#${gradientId}-${item.id})`} stroke={item.colour}
                                            strokeLinejoin="round" strokeDasharray={item.state === 'Cancelled' ? '6 5' : undefined} />
                                    ) : (
                                        <circle className={styles.body} cx={cx} cy={chart.cy} r={Math.max(r, 1)} fill={`url(#${gradientId}-${item.id})`} stroke={item.colour}
                                            strokeDasharray={item.state === 'Cancelled' ? '6 5' : undefined} />
                                    )}
                                    {item.progress > 0 && item.state !== 'Cancelled' && (slice ? (
                                        <path className={`${styles.ring} ${styles.ringSlice}`} d={arc(cx, chart.cy, Math.max(r, 1), slice)} stroke={item.colour} pathLength={100}
                                            strokeDasharray={`${item.progress} 100`} />
                                    ) : (
                                        <circle className={styles.ring} cx={cx} cy={chart.cy} r={Math.max(r, 1)} stroke={item.colour} pathLength={100}
                                            strokeDasharray={`${item.progress} 100`} />
                                    ))}
                                </g>
                            ))}

                            {/* Labels on top of everything, but not in the way of clicks */}
                            <g aria-hidden="true" pointerEvents="none">
                                {chart.labels.filter((l) => l.shown).map((l) => (
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
            {!readOnly && <p className={styles.hint}>
                {hiddenLabels > 0 && <>{hiddenLabels} label{hiddenLabels === 1 ? ' is' : 's are'} hidden to keep the chart readable. </>}
                <span className={styles.pointerHint}>Drag a circle to move it, or its side handles to change the dates. </span>
                <span className={styles.touchHint}>Tap a circle to edit it, then drag its side handles to change the dates.</span>
                <span className={styles.pointerHint}>
                    Keyboard: <kbd>←</kbd><kbd>→</kbd> move, <kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> end date, <kbd>Alt</kbd>+<kbd>←</kbd><kbd>→</kbd> start date.
                </span>
            </p>}
        </div>
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
function placeLabels(circles, cy, width) {
    const boxes = []
    const collides = (b) => boxes.some((o) => b.x1 < o.x2 && b.x2 > o.x1 && b.y1 < o.y2 && b.y2 > o.y1)
    return circles.map(({ item, cx, r, slice }) => {
        const name = item.state === 'Done' ? `✓ ${item.name}` : item.name
        const text = name.length > MAX_LABEL ? `${name.slice(0, MAX_LABEL - 1)}…` : name
        const half = (text.length * CHAR_W) / 2 + 4
        // A slice's label leans towards its side of the circle, and starts below for a bottom slice.
        const [a0, a1] = slice ? sliceAngles(slice) : [0, 0]
        const mid = (a0 + a1) / 2
        const lean = slice && Math.abs(Math.cos(mid)) > 0.2 ? Math.sign(Math.cos(mid)) * (half + 4) : 0
        const x = Math.min(Math.max(cx + lean, half + 2), width - half - 2)
        const above = cy - r - 8, below = cy + r + 18
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

function Tooltip({ circle: { item, cx, r }, cy, width, height, project, items, dragging }) {
    const ref = useRef(null)
    const [boxHeight, setBoxHeight] = useState(0)
    useLayoutEffect(() => { setBoxHeight(ref.current.offsetHeight) })

    // Above the circle if it fits, else just inside its top, else as high as the chart allows.
    const top = cy - r
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
                </>
            )}
        </div>
    )
}

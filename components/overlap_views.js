// The /jw-overlap project summary, filters and item table: used by the page itself (editable) and
// by the hallway screen's /stauperle13/overlap (look only: leave out the on… handlers).

import { Fragment, useRef, useState } from 'react'
import { PRIORITIES, PRIORITY_COLOURS, busiest, daysBetween, fmtDuration, fmtRange, fmtShort, isOverdue, overdueBy, projectProgress, sequenced, shortUrl, toMs } from '../lib/overlap'
import styles from '../styles/overlap.module.scss'

const todayLocal = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD

// ── project summary ──────────────────────────────────────────────────────────

export function ProjectSummary({ project, onEdit, onDelete, onDailyUpdate }) {
    const count = (state) => project.items.filter((i) => i.state === state).length
    const peak = busiest(project)
    const today = todayLocal()
    const overdue = project.items.filter((i) => isOverdue(i, today)).length
    const left = daysBetween(today, project.end)
    const started = toMs(today) >= toMs(project.start)
    const stats = [
        ['Items', project.items.length],
        ['In progress', count('In progress')],
        ['Blocked', count('Blocked'), count('Blocked') > 0 ? 'warn' : null],
        ['Overdue', overdue, overdue > 0 ? 'danger' : null, overdue > 0 && 'past their dates, not done'],
        ['Done', count('Done')],
        ['Peak overlap', peak.count ? `${peak.count} at once` : '–', null, peak.date && `on ${fmtShort(peak.date)}`],
        [started ? 'Days left' : 'Starts in', !started ? daysBetween(today, project.start) : left > 0 ? left : 'Ended', null, started && left > 0 ? `until ${fmtShort(project.end)}` : null],
    ]
    return (
        <section className={styles.summary} aria-labelledby="project-title">
            <div className={styles.summaryHead}>
                <div>
                    <h1 id="project-title">{project.name}</h1>
                    <p className={styles.meta}>
                        <span className={styles.badge} data-tone={project.status}>{project.status}</span>
                        <span>{fmtRange(project.start, project.end)} · {fmtDuration(project.start, project.end)}</span>
                        {project.owner && <span>Owner: {project.owner}</span>}
                        <span>{project.priority} priority</span>
                    </p>
                </div>
                {onEdit && (
                    <div className={styles.row}>
                        <button type="button" onClick={onDailyUpdate}>Daily update</button>
                        <button type="button" onClick={onEdit}>Edit project</button>
                        <button type="button" className={styles.danger} onClick={onDelete}>Delete</button>
                    </div>
                )}
            </div>
            {project.description && <p className={styles.description}>{project.description}</p>}
            <dl className={styles.stats}>
                {stats.map(([label, value, tone, sub]) => (
                    <div key={label} data-tone={tone || undefined}>
                        <dt>{label}</dt>
                        <dd>{value}{sub && <small>{sub}</small>}</dd>
                    </div>
                ))}
            </dl>
            <div className={styles.summaryFoot}>
                <Progress value={projectProgress(project)} label="Project progress, from its items" />
                {project.tags.length > 0 && <Tags tags={project.tags} />}
            </div>
            {project.notes && <p className={styles.notes}><Linkify text={project.notes} /></p>}
            <Links urls={project.links} />
        </section>
    )
}

function Progress({ value, label, colour }) {
    return (
        <div className={styles.progress}>
            <div className={styles.progressBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
                <div style={{ width: `${value}%`, background: colour }} />
            </div>
            <span>{value}%</span>
        </div>
    )
}

function Tags({ tags }) {
    return <ul className={styles.tags}>{tags.map((t) => <li key={t}>{t}</li>)}</ul>
}

// Notes with any http(s) links made clickable (and shortened).
function Linkify({ text }) {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (i % 2
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" title={part}>{shortUrl(part)}</a>
        : <Fragment key={i}>{part}</Fragment>))
}

// The saved links, shortened; the full address shows on hover. With `max`, any beyond that wait
// behind a "+N more" button.
export function Links({ urls, max = Infinity }) {
    const [open, setOpen] = useState(false)
    if (!urls?.length) return null
    const hidden = open || urls.length <= max + 1 ? 0 : urls.length - max
    return (
        <ul className={styles.links}>
            {urls.slice(0, urls.length - hidden).map((url, i) => (
                <li key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer" title={url} onClick={(e) => e.stopPropagation()}>
                        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                            <path d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 014 4l-1 1M9 11.5l-1 1a2.8 2.8 0 01-4-4l1-1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        {shortUrl(url)}
                    </a>
                </li>
            ))}
            {(hidden > 0 || open) && (
                <li>
                    <button type="button" className={styles.moreLinks} aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
                        {open ? 'Show fewer' : `+${hidden} more`}
                    </button>
                </li>
            )}
        </ul>
    )
}

// ── filters ──────────────────────────────────────────────────────────────────

// Within a group any chosen value will do (Elena or Jonny); across groups all must match.
export const NO_FILTER = { hideDone: false, owners: [], priorities: [], tags: [] }
// "Elena, Jonny" (or "Elena & Jonny") is two owners.
const ownersOf = (item) => item.owner.split(/[,&]/).map((o) => o.trim()).filter(Boolean)
export const isFiltering = (f) => f.hideDone || f.owners.length > 0 || f.priorities.length > 0 || f.tags.length > 0
export const matches = (item, f) => !(f.hideDone && item.state === 'Done')
    && (!f.owners.length || ownersOf(item).some((o) => f.owners.includes(o)))
    && (!f.priorities.length || f.priorities.includes(item.priority))
    && (!f.tags.length || item.tags.some((t) => f.tags.includes(t)))

// Chips to narrow down a busy project: only the choices its items actually have.
export function FilterBar({ project, filter, setFilter, count }) {
    if (project.items.length < 2) return null
    const distinct = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
    const groups = [
        ['owners', 'Owner', distinct(project.items.flatMap(ownersOf))],
        ['priorities', 'Priority', [...PRIORITIES].reverse().filter((p) => project.items.some((i) => i.priority === p))],
        ['tags', 'Tag', distinct(project.items.flatMap((i) => i.tags))],
    ].filter(([, , values]) => values.length > 1)
    const toggle = (key, value) => setFilter((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }))
    return (
        <div className={styles.filters} role="group" aria-label="Show only">
            <button type="button" aria-pressed={filter.hideDone} onClick={() => setFilter((f) => ({ ...f, hideDone: !f.hideDone }))}>Hide done</button>
            {groups.map(([key, label, values]) => (
                <span key={key} className={styles.filterGroup} role="group" aria-label={label}>
                    <span className={styles.filterLabel}>{label}</span>
                    {values.map((v) => <button key={v} type="button" aria-pressed={filter[key].includes(v)} onClick={() => toggle(key, v)}>{v}</button>)}
                </span>
            ))}
            {isFiltering(filter) && (
                <span className={styles.filterCount}>
                    Showing {count} of {project.items.length}
                    <button type="button" className={styles.link} onClick={() => setFilter(NO_FILTER)}>Clear</button>
                </span>
            )}
        </div>
    )
}

// ── item list ────────────────────────────────────────────────────────────────

// The priority with signal bars, one more lit for each level up, in its colour (the circles' too).
function PriorityTag({ value }) {
    const level = PRIORITIES.indexOf(value) + 1
    return (
        <span className={styles.prio} data-level={value} style={{ color: PRIORITY_COLOURS[value] }}>
            <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
                {PRIORITIES.map((p, i) => <rect key={p} x={i * 3.5} y={9 - i * 3} width="2.5" height={3 + i * 3} rx="1" className={i < level ? styles.prioOn : ''} />)}
            </svg>
            {value}
        </span>
    )
}

// Whether the item is going on today.
const isToday = (item, today) => toMs(item.start) <= toMs(today) && toMs(today) <= toMs(item.end)

export const byDate = (items) => [...items].sort((a, b) => toMs(a.start) - toMs(b.start) || toMs(a.end) - toMs(b.end) || a.name.localeCompare(b.name))

// Rows can be dragged by their grip (or moved with ↑ ↓ on it) to change the running order: the item
// keeps its length and is rescheduled to start as the item above it ends. Without onOpen, onDelete
// and onReorder (the hallway screen) it's look only: tapping a row highlights its circle.
export function ItemList({ project, active, setActive, onOpen, onDelete, onReorder }) {
    const [drag, setDrag] = useState(null) // { id, y0, dy, mids: [row midpoints of the other items], gap }
    const rows = useRef({})
    // In date order, or in the order rows were dragged into.
    const items = project.manualOrder ? project.items : byDate(project.items)
    const today = todayLocal()
    if (!items.length) return <p className={styles.muted}>{onOpen ? 'Nothing here yet. Use “Add item” to start the chart.' : 'Nothing here yet.'}</p>

    // Moves `item` into the gap before others[gap] (others = every item but this one, in order).
    const place = (item, gap) => {
        const others = items.filter((i) => i.id !== item.id)
        if (gap === items.indexOf(item) || !others.length) return
        const prev = others[gap - 1], next = others[gap]
        const moved = sequenced(item, prev, next)
        onReorder([...others.slice(0, gap), moved, ...others.slice(gap)], moved, prev ? `after “${prev.name}”` : `before “${next.name}”`)
    }

    const gripDown = (e, item) => {
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        const mids = items.filter((i) => i.id !== item.id).map((i) => {
            const r = rows.current[i.id].getBoundingClientRect()
            return r.top + r.height / 2
        })
        setDrag({ id: item.id, y0: e.clientY, dy: 0, mids, gap: items.indexOf(item) })
    }
    const gripMove = (e) => {
        if (!drag) return
        setDrag({ ...drag, dy: e.clientY - drag.y0, gap: drag.mids.filter((m) => m < e.clientY).length })
    }
    const gripUp = (item) => {
        if (!drag) return
        setDrag(null)
        place(item, drag.gap)
    }
    const gripKey = (e, item) => {
        const step = { ArrowUp: -1, ArrowDown: 1 }[e.key]
        if (!step) return
        e.preventDefault()
        const at = items.indexOf(item)
        if (at + step >= 0 && at + step < items.length) place(item, at + step)
    }

    // Where a dragged row would land: a line above the row it would go before (or below the last).
    const others = drag ? items.filter((i) => i.id !== drag.id) : []
    const lineBefore = drag && drag.gap !== items.findIndex((i) => i.id === drag.id) ? others[drag.gap]?.id : null
    const lineAfterLast = drag && drag.gap === others.length && drag.gap !== items.length - 1

    return (
        <div className={styles.tableScroll}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope="col"><span className={styles.srOnly}>Order</span></th>
                        <th scope="col">Item</th>
                        <th scope="col">Dates</th>
                        <th scope="col">Owner</th>
                        <th scope="col">State</th>
                        <th scope="col">Priority</th>
                        <th scope="col">Progress</th>
                        {onOpen && <th scope="col"><span className={styles.srOnly}>Actions</span></th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, n) => (
                        <tr key={item.id} ref={(el) => { rows.current[item.id] = el }}
                            className={[isToday(item, today) && styles.rowToday, isOverdue(item, today) && styles.rowOverdue, active === item.id && styles.rowActive, drag?.id === item.id && styles.rowDragging,
                                lineBefore === item.id && styles.dropBefore, lineAfterLast && n === items.length - 1 && styles.dropAfter].filter(Boolean).join(' ')}
                            style={{ '--item': item.colour, ...(drag?.id === item.id ? { transform: `translateY(${drag.dy}px)` } : {}) }}
                            onMouseEnter={() => setActive(item.id)} onMouseLeave={() => setActive((a) => (a === item.id ? null : a))}>
                            <td className={styles.gripCell}>
                                {onReorder && <button type="button" className={styles.grip} aria-label={`Move ${item.name}: up and down arrows change its place in the order`}
                                    onPointerDown={(e) => gripDown(e, item)} onPointerMove={gripMove} onPointerUp={() => gripUp(item)} onPointerCancel={() => setDrag(null)}
                                    onKeyDown={(e) => gripKey(e, item)}>
                                    <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
                                        {[3, 8, 13].map((y) => <Fragment key={y}><circle cx="2.5" cy={y} r="1.4" /><circle cx="7.5" cy={y} r="1.4" /></Fragment>)}
                                    </svg>
                                </button>}
                            </td>
                            <td>
                                <button type="button" className={styles.itemName} onClick={() => (onOpen ? onOpen(item) : setActive(item.id))}
                                    onFocus={() => setActive(item.id)} onBlur={() => setActive((a) => (a === item.id ? null : a))}>
                                    <span className={styles.swatch} style={{ background: item.colour }} aria-hidden="true" />
                                    {item.name}
                                </button>
                                <Links urls={item.links} max={2} />
                            </td>
                            <td className={styles.nowrap}>
                                {fmtRange(item.start, item.end)}
                                {isOverdue(item, today) ? (
                                    <span className={`${styles.cellNote} ${styles.overdueNote}`}>{overdueBy(item, today)}</span>
                                ) : isToday(item, today) ? (
                                    <span className={`${styles.cellNote} ${styles.todayNote}`}>
                                        Day {Math.min(daysBetween(item.start, today) + 1, daysBetween(item.start, item.end))} of {daysBetween(item.start, item.end)}
                                    </span>
                                ) : <span className={styles.cellNote}>{fmtDuration(item.start, item.end)}</span>}
                            </td>
                            <td>{item.owner || <span className={styles.muted}>–</span>}</td>
                            <td>
                                <span className={styles.badge} data-tone={item.state}>{item.state}</span>
                                {isOverdue(item, today) && <span className={styles.badge} data-tone="Overdue">Overdue</span>}
                            </td>
                            <td><PriorityTag value={item.priority} /></td>
                            <td className={styles.progressCell}><Progress value={item.progress} label={`${item.name} progress`} colour={item.colour} /></td>
                            {onOpen && (
                                <td className={styles.rowActions}>
                                    <button type="button" onClick={() => onOpen(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                                    <button type="button" className={styles.danger} onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

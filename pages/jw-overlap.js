import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
    COLOURS, ITEM_STATES, PRIORITIES, PROJECT_STATUSES,
    addDays, blankItem, blankProject, busiest, circleFor, contains, daysBetween, fmtDate, fmtDuration, fmtRange, fmtShort,
    lateDependencies, nudged, parseTags, projectProgress, sampleProject, sharedDays, ticksFor, toMs, validateItem, validateProject, withProgress, withState,
} from '../lib/overlap'
import { useOverlapStore } from '../components/overlap_store'
import styles from '../styles/overlap.module.scss'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

const todayLocal = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD
const UNDO_LIMIT = 50
const TOAST_MS = 6000

// JW Overlap Chart: plan a project as overlapping circles, one per item, on a single date line.
export default function OverlapPage() {
    const { state, setState, sync, stored, signIn, retry } = useOverlapStore() // { projects, currentId }
    const [askingKey, setAskingKey] = useState(false)
    const [editingProject, setEditingProject] = useState(null) // a draft project, new or existing
    const [editingItem, setEditingItem] = useState(null) // a draft item
    const [active, setActive] = useState(null) // item highlighted in both the chart and the list
    const [toast, setToast] = useState(null) // { message, at }
    const history = useRef([]) // earlier states, for undo

    // Sync news (e.g. a newer copy from another device) shows as a toast.
    useEffect(() => { if (sync.message) setToast({ message: sync.message, at: Date.now() }) }, [sync.message])

    const project = state?.projects.find((p) => p.id === state.currentId) || state?.projects[0] || null

    // Every change goes through here, so it can be undone.
    const commit = (next, message) => {
        history.current = [...history.current.slice(-(UNDO_LIMIT - 1)), state]
        setState(next)
        setToast({ message, at: Date.now() })
    }

    const undo = () => {
        const previous = history.current.pop()
        if (!previous) return
        setState(previous)
        setToast({ message: 'Undone', at: Date.now() })
    }

    useEffect(() => {
        if (!toast) return
        const id = setTimeout(() => setToast(null), TOAST_MS)
        return () => clearTimeout(id)
    }, [toast])

    // Ctrl/Cmd+Z, except while typing or in a dialog (where it undoes the typing).
    useEffect(() => {
        const onKey = (e) => {
            if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.key.toLowerCase() !== 'z') return
            if (document.querySelector('dialog[open]') || e.target.closest?.('input, textarea, select')) return
            e.preventDefault()
            undo()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    })

    // Also stores the project's progress as worked out from its items, so the saved data agrees with the page.
    const withProject = (next) => {
        const synced = { ...next, progress: projectProgress(next) }
        return { ...state, projects: state.projects.map((p) => (p.id === synced.id ? synced : p)) }
    }

    const saveProject = (next) => {
        const exists = state.projects.some((p) => p.id === next.id)
        commit({ projects: exists ? state.projects.map((p) => (p.id === next.id ? next : p)) : [...state.projects, next], currentId: next.id },
            exists ? `Saved “${next.name}”` : `Created “${next.name}”`)
        setEditingProject(null)
    }

    const deleteProject = (p) => {
        if (!window.confirm(`Delete “${p.name}” and its ${p.items.length} item${p.items.length === 1 ? '' : 's'}?`)) return
        const projects = state.projects.filter((x) => x.id !== p.id)
        commit({ projects, currentId: projects[0]?.id ?? null }, `Deleted “${p.name}”`)
        setEditingProject(null)
    }

    const saveItem = (item, message) => {
        const exists = project.items.some((i) => i.id === item.id)
        commit(withProject({ ...project, items: exists ? project.items.map((i) => (i.id === item.id ? item : i)) : [...project.items, item] }),
            message || (exists ? `Saved “${item.name}”` : `Added “${item.name}”`))
        setEditingItem(null)
    }

    // From dragging or the arrow keys on the chart.
    const moveItem = (item) => saveItem(item, `“${item.name}” now ${fmtRange(item.start, item.end)}`)

    const deleteItem = (item) => {
        const items = project.items.filter((i) => i.id !== item.id).map((i) => ({ ...i, dependsOn: i.dependsOn.filter((d) => d !== item.id) }))
        commit(withProject({ ...project, items }), `Deleted “${item.name}”`)
        setEditingItem(null)
        setActive(null)
    }

    const restoreSample = () => {
        const sample = sampleProject()
        commit({ projects: [...state.projects.filter((p) => p.id !== sample.id), sample], currentId: sample.id }, 'Restored the sample project')
    }

    const switchProject = (id) => {
        setState((s) => ({ ...s, currentId: id }))
        setActive(null)
    }

    return (
        <div className={`${styles.app} ${inter.className}`}>
            <Head>
                <title>JW Overlap Chart</title>
                <meta name="description" content="Plan a project as overlapping circles on one timeline." />
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <header className={styles.bar}>
                <Logo className={styles.brand} priority />
                {state && (
                    <div className={styles.barActions}>
                        <SyncStatus sync={sync} onSignIn={() => setAskingKey(true)} onRetry={retry} />
                        {state.projects.length > 0 && (
                            <label className={styles.switcher}>
                                <span className={styles.srOnly}>Project</span>
                                <select value={project?.id || ''} onChange={(e) => switchProject(e.target.value)}>
                                    {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </label>
                        )}
                        <button type="button" className={styles.primary} onClick={() => setEditingProject(blankProject(todayLocal()))}>+ New project</button>
                    </div>
                )}
            </header>

            <main className={styles.main}>
                {!state ? null : !project ? (
                    <section className={styles.empty}>
                        <Logo className={styles.emptyLogo} width={360} />
                        <h1>No projects yet</h1>
                        <p className={styles.muted}>Create a project, then add items to see where they overlap.</p>
                        <div className={styles.row}>
                            <button type="button" className={styles.primary} onClick={() => setEditingProject(blankProject(todayLocal()))}>Create a project</button>
                            <button type="button" onClick={restoreSample}>Load the sample</button>
                        </div>
                    </section>
                ) : (
                    <>
                        <ProjectSummary project={project} onEdit={() => setEditingProject(project)} onDelete={() => deleteProject(project)} />

                        <section className={styles.card} aria-labelledby="chart-title">
                            <div className={styles.cardHead}>
                                <h2 id="chart-title">Timeline</h2>
                                <button type="button" className={styles.primary} onClick={() => setEditingItem(blankItem(project))}>+ Add item</button>
                            </div>
                            <OverlapChart project={project} active={active} setActive={setActive} onOpen={setEditingItem} onChange={moveItem} />
                        </section>

                        <section className={styles.card} aria-labelledby="items-title">
                            <div className={styles.cardHead}>
                                <h2 id="items-title">Items <span className={styles.count}>{project.items.length}</span></h2>
                            </div>
                            <ItemList project={project} active={active} setActive={setActive} onOpen={setEditingItem}
                                onDelete={(item) => window.confirm(`Delete “${item.name}”?`) && deleteItem(item)} />
                        </section>
                    </>
                )}

                <footer className={styles.storage}>
                    {sync.status === 'local' || sync.status === 'badkey' ? (
                        <>
                            {stored ? 'Saved in this browser only: clearing your browser data removes it.' : 'This browser won’t let the page save (private window or storage full): changes will be lost on reload.'}
                            {' '}<button type="button" className={styles.link} onClick={() => setAskingKey(true)}>Sync across devices</button>
                        </>
                    ) : (
                        <>
                            Saved to the server, so every browser sees the same projects, with a copy here for when you’re offline.
                        </>
                    )}
                    {state && <> · <button type="button" className={styles.link} onClick={restoreSample}>Restore the sample project</button></>}
                </footer>
            </main>

            {toast && (
                <div className={styles.toast} role="status" key={toast.at}>
                    <span>{toast.message}</span>
                    {history.current.length > 0 && <button type="button" onClick={undo}>Undo</button>}
                    <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">×</button>
                </div>
            )}

            {askingKey && <KeyDialog rejected={sync.status === 'badkey'} onSubmit={(key) => { signIn(key); setAskingKey(false) }} onClose={() => setAskingKey(false)} />}

            {editingProject && (
                <ProjectEditor
                    project={editingProject}
                    isNew={!state.projects.some((p) => p.id === editingProject.id)}
                    onSave={saveProject}
                    onDelete={deleteProject}
                    onClose={() => setEditingProject(null)}
                />
            )}
            {editingItem && project && (
                <ItemEditor
                    item={editingItem}
                    project={project}
                    isNew={!project.items.some((i) => i.id === editingItem.id)}
                    onSave={(item) => saveItem(item)}
                    onDelete={(item) => window.confirm(`Delete “${item.name}”?`) && deleteItem(item)}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    )
}

// ── saving ───────────────────────────────────────────────────────────────────

const SYNC_LABELS = { loading: 'Connecting…', saving: 'Saving…', saved: 'Saved', offline: 'Offline', badkey: 'Key not accepted', local: 'This browser only' }

function SyncStatus({ sync, onSignIn, onRetry }) {
    const time = sync.updated && new Date(sync.updated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const title = {
        saved: time ? `Saved to the server at ${time}` : 'Saved to the server',
        offline: 'Can’t reach the server: changes are kept in this browser. Click to try again.',
        local: 'Saved in this browser only. Click to sync across devices.',
        badkey: 'The key wasn’t accepted. Click to enter it again.',
    }[sync.status]
    const action = { local: onSignIn, badkey: onSignIn, offline: onRetry }[sync.status]
    const content = <><span className={styles.syncDot} aria-hidden="true" />{SYNC_LABELS[sync.status]}</>
    return action
        ? <button type="button" className={styles.sync} data-status={sync.status} title={title} onClick={action}>{content}</button>
        : <span className={styles.sync} data-status={sync.status} title={title} role="status">{content}</span>
}

function KeyDialog({ rejected, onSubmit, onClose }) {
    const [value, setValue] = useState('')
    const id = useId()
    return (
        <Modal title="Sync across devices" onClose={onClose}>
            <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value) }}>
                <p className={styles.dialogNote}>
                    Enter your key to save your projects to the server, so they’re the same on every device.
                    Projects that are only in this browser are added, not replaced.
                </p>
                {rejected && <p className={styles.alert} role="alert">That key wasn’t accepted. Check it and try again.</p>}
                <div className={styles.field}>
                    <label htmlFor={id}>Key</label>
                    <input id={id} type="password" autoComplete="current-password" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
                    <p className={styles.fieldHint}>Or open the page once as /jw-overlap?key=… on each device.</p>
                </div>
                <div className={styles.dialogActions}>
                    <span className={styles.spacer} />
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" className={styles.primary}>Connect</button>
                </div>
            </form>
        </Modal>
    )
}

// ── project summary ──────────────────────────────────────────────────────────

function ProjectSummary({ project, onEdit, onDelete }) {
    const count = (state) => project.items.filter((i) => i.state === state).length
    const peak = busiest(project)
    const today = todayLocal()
    const left = daysBetween(today, project.end)
    const started = toMs(today) >= toMs(project.start)
    const stats = [
        ['Items', project.items.length],
        ['In progress', count('In progress')],
        ['Blocked', count('Blocked'), count('Blocked') > 0 ? 'warn' : null],
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
                <div className={styles.row}>
                    <button type="button" onClick={onEdit}>Edit project</button>
                    <button type="button" className={styles.danger} onClick={onDelete}>Delete</button>
                </div>
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

// Notes with any http(s) links made clickable.
function Linkify({ text }) {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (i % 2
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
        : <Fragment key={i}>{part}</Fragment>))
}

// ── chart ────────────────────────────────────────────────────────────────────

const PAD_X = 36
const MIN_WIDTH = 560 // below this the chart scrolls sideways rather than squashing the dates
const LABEL_H = 26
const AXIS_H = 44
const CHAR_W = 7 // rough width of a 13px label character, for collision checks
const MAX_LABEL = 30
const DRAG_PX = 4 // movement before a press counts as a drag rather than a click
const KEYS = { ArrowLeft: -1, ArrowRight: 1 }

function OverlapChart({ project, active, setActive, onOpen, onChange }) {
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
        const w = Math.max(width, MIN_WIDTH)
        const days = daysBetween(project.start, project.end)
        const pxPerDay = (w - PAD_X * 2) / days
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
    }, [project, items, width])

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
                    <div className={styles.chartInner} style={{ width: chart.w, height: chart.h }}>
                        <svg width={chart.w} height={chart.h} role="group" className={focusId ? styles.hasFocus : ''}
                            aria-label={`Timeline from ${fmtDate(project.start)} to ${fmtDate(project.end)}. Each circle is an item: Enter edits it, arrow keys move it.`}>
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
                                    onClick={(e) => onTap(e, item)}
                                    onKeyDown={(e) => onKey(e, item)}
                                    onMouseEnter={() => !drag && setActive(item.id)}
                                    onMouseLeave={(e) => leave(e, item.id)}
                                    onFocus={() => setActive(item.id)}
                                    onBlur={() => setActive((a) => (a === item.id ? null : a))}
                                    {...pressHandlers(item, 'move')}
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
                            {focused && (
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

                        {focused && <Tooltip circle={focused} cy={chart.cy} width={chart.w} project={project} items={items} dragging={!!drag?.moved} />}
                    </div>
                )}
                {project.items.length === 0 && <p className={styles.chartEmpty}>No items yet. Add one to draw its circle.</p>}
            </div>
            <p className={styles.hint}>
                {hiddenLabels > 0 && <>{hiddenLabels} label{hiddenLabels === 1 ? ' is' : 's are'} hidden to keep the chart readable. </>}
                <span className={styles.pointerHint}>Drag a circle to move it, or its side handles to change the dates. </span>
                <span className={styles.touchHint}>Tap a circle to edit it, then drag its side handles to change the dates.</span>
                <span className={styles.pointerHint}>
                    Keyboard: <kbd>←</kbd><kbd>→</kbd> move, <kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> end date, <kbd>Alt</kbd>+<kbd>←</kbd><kbd>→</kbd> start date.
                </span>
            </p>
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

function Tooltip({ circle: { item, cx, r }, cy, width, project, items, dragging }) {
    const top = cy - r
    const below = top < 150 // not enough room above: show it just inside the circle's top
    const deps = project.items.filter((i) => item.dependsOn.includes(i.id))
    const overlaps = items
        .filter((o) => o.id !== item.id && sharedDays(item, o) > 0)
        .map((o) => ({ o, text: o.start === item.start && o.end === item.end ? 'same dates' : contains(o, item) ? 'inside it' : contains(item, o) ? 'inside this' : `${sharedDays(item, o)} d` }))
    return (
        <div className={`${styles.tooltip} ${dragging ? styles.tooltipLive : ''}`}
            style={{ left: Math.min(Math.max(cx, 140), width - 140), top: below ? top + 14 : top - 14, transform: below ? 'translateX(-50%)' : 'translate(-50%, -100%)' }}>
            <strong><span className={styles.swatch} style={{ background: item.colour }} />{item.name}</strong>
            <span className={styles.tooltipDates}>{fmtRange(item.start, item.end)} · {fmtDuration(item.start, item.end)}</span>
            {!dragging && (
                <>
                    <span><span className={styles.badge} data-tone={item.state}>{item.state}</span> {item.progress}%{item.owner ? ` · ${item.owner}` : ''}</span>
                    {overlaps.length > 0 && (
                        <span className={styles.tooltipList}>
                            Overlaps {overlaps.map(({ o, text }, i) => (
                                <Fragment key={o.id}>{i > 0 && ', '}<b style={{ color: o.colour }}>{o.name}</b> ({text})</Fragment>
                            ))}
                        </span>
                    )}
                    {deps.length > 0 && <span className={styles.tooltipList}>After {deps.map((d) => d.name).join(', ')}</span>}
                </>
            )}
        </div>
    )
}

// ── item list ────────────────────────────────────────────────────────────────

function ItemList({ project, active, setActive, onOpen, onDelete }) {
    if (!project.items.length) return <p className={styles.muted}>Nothing here yet. Use “Add item” to start the chart.</p>
    const items = [...project.items].sort((a, b) => toMs(a.start) - toMs(b.start) || toMs(a.end) - toMs(b.end) || a.name.localeCompare(b.name))
    return (
        <div className={styles.tableScroll}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Dates</th>
                        <th scope="col">Duration</th>
                        <th scope="col">Owner</th>
                        <th scope="col">State</th>
                        <th scope="col">Progress</th>
                        <th scope="col"><span className={styles.srOnly}>Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className={active === item.id ? styles.rowActive : ''} style={{ '--item': item.colour }}
                            onMouseEnter={() => setActive(item.id)} onMouseLeave={() => setActive((a) => (a === item.id ? null : a))}>
                            <td>
                                <button type="button" className={styles.itemName} onClick={() => onOpen(item)}
                                    onFocus={() => setActive(item.id)} onBlur={() => setActive((a) => (a === item.id ? null : a))}>
                                    <span className={styles.swatch} style={{ background: item.colour }} aria-hidden="true" />
                                    {item.name}
                                </button>
                            </td>
                            <td className={styles.nowrap}>{fmtRange(item.start, item.end)}</td>
                            <td className={styles.nowrap}>{fmtDuration(item.start, item.end)}</td>
                            <td>{item.owner || <span className={styles.muted}>–</span>}</td>
                            <td><span className={styles.badge} data-tone={item.state}>{item.state}</span></td>
                            <td className={styles.progressCell}><Progress value={item.progress} label={`${item.name} progress`} colour={item.colour} /></td>
                            <td className={styles.rowActions}>
                                <button type="button" onClick={() => onOpen(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                                <button type="button" className={styles.danger} onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// ── editors ──────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
    const ref = useRef(null)
    useEffect(() => {
        const dialog = ref.current
        dialog.showModal()
        return () => dialog.close()
    }, [])
    return (
        <dialog ref={ref} className={styles.dialog} aria-label={title} onCancel={(e) => { e.preventDefault(); onClose() }}
            onClick={(e) => e.target === ref.current && onClose()}>
            <div className={styles.dialogBody}>
                <div className={styles.dialogHead}>
                    <h2>{title}</h2>
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Close">×</button>
                </div>
                {children}
            </div>
        </dialog>
    )
}

// The form's copy of a project or item: tags as text, the rest as stored.
const toDraft = (v) => ({ ...v, tagsText: v.tags.join(', ') })
const fromDraft = ({ tagsText, ...v }) => ({ ...v, name: v.name.trim(), tags: parseTags(tagsText), progress: Number(v.progress) })

function useDraft(initial) {
    const [draft, setDraft] = useState(() => toDraft(initial))
    const [errors, setErrors] = useState({})
    const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))
    return { draft, setDraft, errors, setErrors, set }
}

function Field({ label, error, children, wide, hint }) {
    const id = useId()
    const errorId = `${id}-error`
    return (
        <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
            <label htmlFor={id}>{label}</label>
            {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? errorId : undefined })}
            {hint && !error && <p className={styles.fieldHint}>{hint}</p>}
            {error && <p className={styles.error} id={errorId}>{error}</p>}
        </div>
    )
}

// Name, dates, owner, progress, priority, tags, description and notes: shared by both editors.
// A project's progress comes from its items, so it gets `progressNote` instead of a slider;
// an item passes `onProgress` to keep its state in step.
function CommonFields({ draft, set, errors, dateBounds, progressNote, onProgress }) {
    return (
        <>
            <Field label="Name *" error={errors.name} wide>{(a) => <input {...a} value={draft.name} onChange={set('name')} autoFocus />}</Field>
            <Field label="Start date *" error={errors.start}>{(a) => <input {...a} type="date" value={draft.start} onChange={set('start')} {...dateBounds} />}</Field>
            <Field label="End date *" error={errors.end}>{(a) => <input {...a} type="date" value={draft.end} onChange={set('end')} {...dateBounds} />}</Field>
            <Field label="Owner">{(a) => <input {...a} value={draft.owner} onChange={set('owner')} />}</Field>
            <Field label="Priority">{(a) => <select {...a} value={draft.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>}</Field>
            {progressNote ? (
                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Progress</span>
                    <p className={styles.autoValue}>{progressNote}</p>
                </div>
            ) : (
                <Field label={`Progress: ${draft.progress}%`} error={errors.progress}>
                    {(a) => <input {...a} type="range" min={0} max={100} step={5} value={draft.progress} onChange={onProgress || set('progress')} />}
                </Field>
            )}
            <Field label="Tags" hint="Separate with commas">{(a) => <input {...a} value={draft.tagsText} onChange={set('tagsText')} />}</Field>
            <Field label="Description" wide>{(a) => <textarea {...a} rows={2} value={draft.description} onChange={set('description')} />}</Field>
            <Field label="Notes or links" wide>{(a) => <textarea {...a} rows={2} value={draft.notes} onChange={set('notes')} />}</Field>
        </>
    )
}

function ProjectEditor({ project, isNew, onSave, onDelete, onClose }) {
    const { draft, errors, setErrors, set } = useDraft(project)
    const submit = (e) => {
        e.preventDefault()
        const next = fromDraft(draft)
        const found = validateProject(next)
        setErrors(found)
        if (!Object.keys(found).length) onSave(next)
    }
    return (
        <Modal title={isNew ? 'New project' : 'Edit project'} onClose={onClose}>
            <form onSubmit={submit} noValidate>
                {errors.dates && <p className={styles.alert} role="alert">{errors.dates}</p>}
                <div className={styles.form}>
                    <CommonFields draft={draft} set={set} errors={errors}
                        progressNote={isNew ? 'Worked out from the items as you add them' : `${projectProgress(project)}%, worked out from the items`} />
                    <Field label="Status">{(a) => <select {...a} value={draft.status} onChange={set('status')}>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
                </div>
                <div className={styles.dialogActions}>
                    {!isNew && <button type="button" className={styles.danger} onClick={() => onDelete(project)}>Delete project</button>}
                    <span className={styles.spacer} />
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" className={styles.primary}>{isNew ? 'Create project' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    )
}

function ItemEditor({ item, project, isNew, onSave, onDelete, onClose }) {
    const { draft, setDraft, errors, setErrors, set } = useDraft(item)
    const others = project.items.filter((i) => i.id !== item.id)
    const late = lateDependencies(draft, project)

    const toggleDependency = (id) => setDraft((d) => ({ ...d, dependsOn: d.dependsOn.includes(id) ? d.dependsOn.filter((x) => x !== id) : [...d.dependsOn, id] }))

    const submit = (e) => {
        e.preventDefault()
        const next = fromDraft(draft)
        const found = validateItem(next, project)
        setErrors(found)
        if (!Object.keys(found).length) onSave(next)
    }

    return (
        <Modal title={isNew ? 'New item' : 'Edit item'} onClose={onClose}>
            <form onSubmit={submit} noValidate>
                <p className={styles.dialogNote}>Dates must fall within the project: {fmtRange(project.start, project.end)}.</p>
                <div className={styles.form}>
                    <CommonFields draft={draft} set={set} errors={errors} dateBounds={{ min: project.start, max: project.end }}
                        onProgress={(e) => setDraft((d) => withProgress(d, Number(e.target.value)))} />
                    <Field label="State">{(a) => <select {...a} value={draft.state} onChange={(e) => setDraft((d) => withState(d, e.target.value))}>{ITEM_STATES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>

                    <fieldset className={`${styles.field} ${styles.wide}`}>
                        <legend>Colour</legend>
                        <div className={styles.colours}>
                            {COLOURS.map((c) => (
                                <label key={c} className={styles.colourOption} title={c}>
                                    <input type="radio" name="colour" value={c} checked={draft.colour === c} onChange={set('colour')} />
                                    <span style={{ background: c }} />
                                    <span className={styles.srOnly}>{c}</span>
                                </label>
                            ))}
                            <label className={styles.customColour}>
                                <input type="color" value={draft.colour} onChange={set('colour')} />
                                <span>Custom</span>
                            </label>
                        </div>
                    </fieldset>

                    <fieldset className={`${styles.field} ${styles.wide}`} aria-describedby={errors.dependsOn ? 'deps-error' : undefined}>
                        <legend>Depends on</legend>
                        {others.length ? (
                            <div className={styles.deps}>
                                {others.map((o) => (
                                    <label key={o.id} className={styles.dep}>
                                        <input type="checkbox" checked={draft.dependsOn.includes(o.id)} onChange={() => toggleDependency(o.id)} />
                                        <span className={styles.swatch} style={{ background: o.colour }} aria-hidden="true" />
                                        {o.name} <span className={styles.muted}>{fmtRange(o.start, o.end)}</span>
                                    </label>
                                ))}
                            </div>
                        ) : <p className={styles.muted}>No other items in this project yet.</p>}
                        {errors.dependsOn && <p className={styles.error} id="deps-error">{errors.dependsOn}</p>}
                        {!errors.dependsOn && late.length > 0 && (
                            <p className={styles.fieldHint}>Heads up: {late.map((d) => d.name).join(', ')} {late.length === 1 ? 'ends' : 'end'} after this starts.</p>
                        )}
                    </fieldset>
                </div>
                <div className={styles.dialogActions}>
                    {!isNew && <button type="button" className={styles.danger} onClick={() => onDelete(item)}>Delete item</button>}
                    <span className={styles.spacer} />
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" className={styles.primary}>{isNew ? 'Add item' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    )
}

// public/jw-overlap/logo.png: the circles and the name, on white (blended away by the styles).
// `width` is the displayed width, so Next serves a copy that size rather than the 2120px original.
function Logo({ className, width = 222, priority }) {
    return <Image src="/jw-overlap/logo.png" alt="JW Overlap Chart" width={width} height={Math.round((width * 400) / 2120)} className={`${styles.logo} ${className}`} priority={priority} />
}

import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
    ITEM_STATES, PRIORITIES, PROJECT_STATUSES,
    blankItem, blankProject, coloured, fmtRange, fullUrl, isDate,
    lateDependencies, parseTags, projectProgress, sampleProject, toMs, validateItem, validateProject, widenedFor, withProgress, withState,
} from '../lib/overlap'
import OverlapChart from '../components/overlap_chart'
import { useOverlapStore } from '../components/overlap_store'
import { FilterBar, ItemList, NO_FILTER, ProjectSummary, byDate, isFiltering, matches } from '../components/overlap_views'
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
    const [filter, setFilter] = useState(NO_FILTER) // which items the chart and the list show
    const [toast, setToast] = useState(null) // { message, at }
    const history = useRef([]) // earlier states, for undo

    // Sync news (e.g. a newer copy from another device) shows as a toast.
    useEffect(() => { if (sync.message) setToast({ message: sync.message, at: Date.now() }) }, [sync.message])

    const current = state?.projects.find((p) => p.id === state.currentId) || state?.projects[0] || null
    const project = useMemo(() => coloured(current), [current])
    useEffect(() => setFilter(NO_FILTER), [project?.id])
    const filtering = isFiltering(filter)
    const shown = project && filtering ? { ...project, items: project.items.filter((i) => matches(i, filter)) } : project

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
        const widened = widenedFor(project, item)
        const grew = widened.start !== project.start || widened.end !== project.end
        commit(withProject({ ...widened, items: withItem(project, item) }),
            (message || `${exists ? 'Saved' : 'Added'} “${item.name}”`) + (grew ? `: the project now runs ${fmtRange(widened.start, widened.end)}` : ''))
        setEditingItem(null)
    }

    // From dragging a row in the table: `items` is the new running order, `moved` the item at its new
    // dates. The table keeps this order from then on (manualOrder) until it's sorted by date again.
    const reorderItems = (items, moved, where) => {
        const widened = widenedFor(project, moved)
        const grew = widened.start !== project.start || widened.end !== project.end
        commit(withProject({ ...widened, manualOrder: true, items: items.map((i) => (i.id === moved.id ? moved : i)) }),
            `“${moved.name}” now ${fmtRange(moved.start, moved.end)}, ${where}` + (grew ? `: the project now runs ${fmtRange(widened.start, widened.end)}` : ''))
    }

    const sortByDate = () => commit(withProject({ ...project, manualOrder: false, items: byDate(project.items) }), 'Items sorted by date')

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
                            <FilterBar project={project} filter={filter} setFilter={setFilter} count={shown.items.length} />
                            <OverlapChart project={shown} active={active} setActive={setActive} onOpen={setEditingItem} onChange={moveItem} />
                        </section>

                        <section className={styles.card} aria-labelledby="items-title">
                            <div className={styles.cardHead}>
                                <h2 id="items-title">Items <span className={styles.count}>{filtering ? `${shown.items.length} of ${project.items.length}` : project.items.length}</span></h2>
                                {project.manualOrder && <button type="button" onClick={sortByDate}>Sort by date</button>}
                            </div>
                            {/* Reordering needs every row in view, so it's off while filtering. */}
                            <ItemList project={shown} active={active} setActive={setActive} onOpen={setEditingItem}
                                onDelete={(item) => window.confirm(`Delete “${item.name}”?`) && deleteItem(item)}
                                onReorder={filtering ? null : reorderItems} />
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

// ── item list ────────────────────────────────────────────────────────────────

// The items with `item` added or saved. In a dragged (manual) order, an item whose dates changed
// goes to its place by date among the others, so the table never contradicts the dates; the rest
// keep their order.
function withItem(project, item) {
    const old = project.items.find((i) => i.id === item.id)
    if (old && (!project.manualOrder || (old.start === item.start && old.end === item.end))) return project.items.map((i) => (i.id === item.id ? item : i))
    const others = project.items.filter((i) => i.id !== item.id)
    if (!project.manualOrder) return [...others, item]
    const at = others.findIndex((o) => byDate([o, item])[0] === item)
    return at < 0 ? [...others, item] : [...others.slice(0, at), item, ...others.slice(at)]
}

// ── editors ──────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
    const ref = useRef(null)
    useEffect(() => {
        const dialog = ref.current
        dialog.showModal()
        // showModal focuses the first button (the ×), undoing the form's autoFocus: put it back.
        dialog.querySelector('form input, form textarea, form select')?.focus()
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
const toDraft = (v) => ({ ...v, tagsText: v.tags.join(', '), links: v.links || [] })
const fromDraft = ({ tagsText, ...v }) => ({ ...v, name: v.name.trim(), tags: parseTags(tagsText), progress: Number(v.progress), links: v.links.map(fullUrl).filter(Boolean) })

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

// Name, dates, owner, progress, priority, tags, description, notes and links: shared by both editors.
// A project's progress comes from its items, so it gets `progressNote` instead of a slider;
// an item passes `onProgress` to keep its state in step.
function CommonFields({ draft, set, setDraft, errors, progressNote, onProgress }) {
    return (
        <>
            <Field label="Name *" error={errors.name} wide>{(a) => <input {...a} value={draft.name} onChange={set('name')} autoFocus />}</Field>
            <Field label="Start date *" error={errors.start}>{(a) => <input {...a} type="date" value={draft.start} onChange={set('start')} />}</Field>
            <Field label="End date *" error={errors.end}>{(a) => <input {...a} type="date" value={draft.end} onChange={set('end')} />}</Field>
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
            <Field label="Notes" wide>{(a) => <textarea {...a} rows={2} value={draft.notes} onChange={set('notes')} />}</Field>
            <LinkFields links={draft.links} error={errors.links} onChange={(links) => setDraft((d) => ({ ...d, links }))} />
        </>
    )
}

// As many links as you like, one box each.
function LinkFields({ links, error, onChange }) {
    const list = useRef(null)
    const add = () => {
        onChange([...links, ''])
        requestAnimationFrame(() => [...list.current.querySelectorAll('input')].pop()?.focus())
    }
    return (
        <fieldset className={`${styles.field} ${styles.wide}`} aria-describedby={error ? 'links-error' : undefined}>
            <legend>Links</legend>
            <div className={styles.linkFields} ref={list}>
                {links.map((url, i) => (
                    <div key={i} className={styles.linkField}>
                        <input type="url" inputMode="url" placeholder="https://…" aria-label={`Link ${i + 1}`} value={url}
                            onChange={(e) => onChange(links.map((u, j) => (j === i ? e.target.value : u)))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
                        <button type="button" aria-label={`Remove link ${i + 1}`} onClick={() => onChange(links.filter((_, j) => j !== i))}>×</button>
                    </div>
                ))}
                <button type="button" className={styles.addLink} onClick={add}>+ Add link</button>
            </div>
            {error && <p className={styles.error} id="links-error">{error}</p>}
        </fieldset>
    )
}

function ProjectEditor({ project, isNew, onSave, onDelete, onClose }) {
    const { draft, setDraft, errors, setErrors, set } = useDraft(project)
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
                    <CommonFields draft={draft} set={set} setDraft={setDraft} errors={errors}
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
    const wider = isDate(draft.start) && isDate(draft.end) && toMs(draft.end) > toMs(draft.start) ? widenedFor(project, draft) : project
    const widens = wider.start !== project.start || wider.end !== project.end

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
                <p className={styles.dialogNote}>
                    {widens
                        ? <>These dates are outside the project, so saving widens it to {fmtRange(wider.start, wider.end)}.</>
                        : <>The project runs {fmtRange(project.start, project.end)}. Dates outside it widen the project.</>}
                </p>
                <div className={styles.form}>
                    <CommonFields draft={draft} set={set} setDraft={setDraft} errors={errors}
                        onProgress={(e) => setDraft((d) => withProgress(d, Number(e.target.value)))} />
                    <Field label="State">{(a) => <select {...a} value={draft.state} onChange={(e) => setDraft((d) => withState(d, e.target.value))}>{ITEM_STATES.map((s) => <option key={s}>{s}</option>)}</select>}</Field>

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

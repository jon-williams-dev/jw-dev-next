import { useEffect, useMemo, useRef, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import OverlapChart from '../../components/overlap_chart'
import { FilterBar, ItemList, NO_FILTER, ProjectSummary, isFiltering, matches } from '../../components/overlap_views'
import { OverlapIcon } from '../../components/kiosk_icons'
import { coloured } from '../../lib/overlap'
import overlapStyles from '../../styles/overlap.module.scss'
import styles from '../../styles/stauperle.module.scss'

const REFRESH_MS = 5 * 60 * 1000
const CHART_SHARE = 0.62 // of the screen's height, so the start of the table peeks out below

// The saved /jw-overlap projects (pages/api/overlap.js), refreshed every few minutes.
function useProjects() {
    const [state, setState] = useState({ data: null, error: null })
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/overlap', { cache: 'no-store', signal: AbortSignal.timeout(15000) })
                const body = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
                if (!cancelled) setState({ data: body.data || { projects: [] }, error: null })
            } catch (err) {
                if (!cancelled) setState((s) => ({ ...s, error: err.message }))
            }
        }
        load()
        const id = setInterval(load, REFRESH_MS)
        return () => { cancelled = true; clearInterval(id) }
    }, [])
    return state
}

// The height of the scrolling area, which sizes the chart.
function useHeight() {
    const ref = useRef(null)
    const [height, setHeight] = useState(0)
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => setHeight(Math.floor(entry.contentRect.height)))
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])
    return [ref, height]
}

// Hallway screen: everything /jw-overlap shows (summary, chart, filters, items), to look at and
// scroll through; editing stays on /jw-overlap.
export default function Overlap() {
    const { data, error } = useProjects()
    const [chosen, setChosen] = useState(null)
    const [active, setActive] = useState(null)
    const [filter, setFilter] = useState(NO_FILTER)
    const [scrollRef, height] = useHeight()

    const projects = data?.projects || []
    const current = projects.find((p) => p.id === chosen) || projects.find((p) => p.id === data?.currentId) || projects[0]
    const project = useMemo(() => coloured(current), [current])
    const filtering = isFiltering(filter)
    const shown = project && filtering ? { ...project, items: project.items.filter((i) => matches(i, filter)) } : project

    const choose = (id) => {
        setChosen(id)
        setActive(null)
        setFilter(NO_FILTER)
    }

    return (
        <KioskLayout title="Projects">
            {/* A tap away from the circles and rows closes the details. */}
            <div className={styles.overlapScroll} ref={scrollRef} onClick={(e) => !e.target.closest('[role=button], tr, button') && setActive(null)}>
                {projects.length > 1 && (
                    <nav className={styles.projectSwitch} aria-label="Projects">
                        {projects.map((p) => (
                            <button key={p.id} type="button" aria-pressed={p.id === project.id} onClick={() => choose(p.id)}>{p.name}</button>
                        ))}
                    </nav>
                )}
                {project ? (
                    <div className={`${overlapStyles.app} ${overlapStyles.onKiosk} ${styles.overlapPage}`}>
                        <ProjectSummary project={project} />
                        <section className={overlapStyles.card} aria-label="Timeline">
                            <FilterBar project={project} filter={filter} setFilter={setFilter} count={shown.items.length} />
                            {height > 0 && (
                                <OverlapChart key={project.id} project={shown} active={active} setActive={setActive} readOnly zoomable fitHeight={Math.round(height * CHART_SHARE)}
                                    onReset={() => { setFilter(NO_FILTER); setActive(null) }} />
                            )}
                        </section>
                        <section className={overlapStyles.card} aria-labelledby="items-title">
                            <div className={overlapStyles.cardHead}>
                                <h2 id="items-title">Items <span className={overlapStyles.count}>{filtering ? `${shown.items.length} of ${project.items.length}` : project.items.length}</span></h2>
                            </div>
                            <ItemList project={shown} active={active} setActive={setActive} />
                        </section>
                    </div>
                ) : (
                    <section className={`${styles.placeholder} ${styles.overlapPlaceholder}`}>
                        <OverlapIcon />
                        <h2>Projects</h2>
                        <p>{error ? `Can’t load the projects – ${error}. Retrying…` : data ? 'No projects yet: add one at jon-williams.dev/jw-overlap.' : 'Loading…'}</p>
                    </section>
                )}
            </div>
        </KioskLayout>
    )
}

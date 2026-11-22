import { useEffect, useRef, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import OverlapChart from '../../components/overlap_chart'
import { OverlapIcon } from '../../components/kiosk_icons'
import { fmtRange, projectProgress } from '../../lib/overlap'
import overlapStyles from '../../styles/overlap.module.scss'
import styles from '../../styles/stauperle.module.scss'

const REFRESH_MS = 5 * 60 * 1000

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

// The height the chart has to fill, so the biggest circle fits without scrolling.
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

// Hallway screen: the JW Overlap Chart timelines, to look at (editing stays on /jw-overlap).
export default function Overlap() {
    const { data, error } = useProjects()
    const [chosen, setChosen] = useState(null)
    const [active, setActive] = useState(null)
    const [stageRef, height] = useHeight()

    const projects = data?.projects || []
    const project = projects.find((p) => p.id === chosen) || projects.find((p) => p.id === data?.currentId) || projects[0]

    const choose = (id) => {
        setChosen(id)
        setActive(null)
    }

    return (
        <KioskLayout title="Projects">
            {projects.length > 1 && (
                <nav className={styles.projectSwitch} aria-label="Projects">
                    {projects.map((p) => (
                        <button key={p.id} type="button" aria-pressed={p.id === project.id} onClick={() => choose(p.id)}>{p.name}</button>
                    ))}
                </nav>
            )}
            {project && (
                <p className={styles.projectFacts}>
                    {fmtRange(project.start, project.end)} · {project.items.length} item{project.items.length === 1 ? '' : 's'} · {projectProgress(project)}% done
                </p>
            )}
            {/* A tap away from the circles closes the details. */}
            <div className={styles.overlapStage} ref={stageRef} onClick={(e) => !e.target.closest('[role=button]') && setActive(null)}>
                {project ? (
                    height > 0 && (
                        <div className={`${overlapStyles.app} ${overlapStyles.onKiosk}`}>
                            <OverlapChart key={project.id} project={project} active={active} setActive={setActive} readOnly fitHeight={height} />
                        </div>
                    )
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

import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Montserrat } from 'next/font/google'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBeerMugEmpty, faBolt, faCalendarDay, faCheck, faChevronLeft, faChevronRight, faDumbbell, faListCheck,
    faCopy, faDroplet, faEye, faEyeSlash, faMugHot, faStar, faPersonRunning, faShareNodes, faUpRightAndDownLeftFromCenter, faUserGear, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/spr.module.scss'

const SprChart = dynamic(() => import('../components/spr_chart'), { ssr: false })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800', '900'], style: ['normal', 'italic'] })

const KEY_STORAGE = 'spr:key'
const TAB_STORAGE = 'spr:tab'
const TABS = [['today', 'Today', faCalendarDay], ['runs', 'Runs', faPersonRunning], ['drinks', 'Drinks', faBeerMugEmpty], ['plan', 'Plan', faListCheck]]
const ADMIN_TAB = ['admin', 'Admin', faUserGear] // the owner's only
// Laid out two per row: Meal 1 | Snack 1, Meal 2 | Snack 2, ...
const MEALS = [['meal1', 'Meal 1'], ['snack1', 'Snack 1'], ['meal2', 'Meal 2'], ['snack2', 'Snack 2'], ['meal3', 'Meal 3'], ['snack3', 'Snack 3']]
const EMPTY_DAY = { meal1: false, snack1: false, meal2: false, snack2: false, meal3: false, snack3: false, abs: false, challenge: false, notes: '', water: 0, coffee: 0 }
const WATER_GOAL = 4 // litres a day
const WATER_STEPS = [0.25, 0.5, 1]
const DEFAULT_LENGTH = 90
const DAY_MS = 864e5
const DATE = /^\d{4}-\d{2}-\d{2}$/

// Dates are plain YYYY-MM-DD strings. Today is the local date; the arithmetic runs in UTC so
// daylight saving never shifts a day.
const today = () => new Date().toLocaleDateString('en-CA')
const addDays = (date, n) => new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS)
const monday = (date) => addDays(date, -((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7))
const fmt = (date, options) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...options })
const longDate = (d) => fmt(d, { weekday: 'short', day: 'numeric', month: 'short' })
const shortDate = (d) => fmt(d, { day: 'numeric', month: 'short' })
const round = (n) => +n.toFixed(2)
const sum = (entries, field) => round(entries.reduce((total, e) => total + (e[field] || 0), 0))
const cx = (...names) => names.filter(Boolean).join(' ')

const mealsDone = (day) => MEALS.filter(([k]) => day?.[k]).length
const coreDone = (day) => !!(day?.abs || day?.challenge)
const water = (day) => day?.water || 0
const waterDone = (day) => water(day) >= WATER_GOAL
const litres = (n) => `${round(n)} L`
const coffee = (day) => day?.coffee || 0
const cups = (n) => `${n} ${n === 1 ? 'cup' : 'cups'}`
const isComplete = (day) => mealsDone(day) === MEALS.length && coreDone(day) && waterDone(day)
// Today's ring: one point per meal, one for abs or challenge, one for the water goal.
const score = (day) => mealsDone(day) + (coreDone(day) ? 1 : 0) + (waterDone(day) ? 1 : 0)
const SCORE_MAX = MEALS.length + 2

// The key is picked up once from /spr?key=... and remembered on this device.
function loadKey(fromUrl) {
    if (fromUrl) {
        store(KEY_STORAGE, fromUrl)
        return fromUrl
    }
    try { return localStorage.getItem(KEY_STORAGE) || '' } catch { return '' }
}
const store = (name, value) => {
    try { value ? localStorage.setItem(name, value) : localStorage.removeItem(name) } catch { }
}

// Waves never overlap, so a date is in at most one.
const waveEnd = (wave) => addDays(wave.start, wave.length) // the day after the last
const waveFor = (waves, date) => waves.find(w => date >= w.start && date < waveEnd(w)) || null
const sortWaves = (waves) => [...waves].sort((a, b) => a.start.localeCompare(b.start))

// Day and week numbers for a wave; without one, weeks run Monday to Sunday.
function programFor(wave) {
    const start = wave?.start || null
    const length = wave?.length || DEFAULT_LENGTH
    const weeks = Math.ceil(length / 7)
    // 1-based; below 1 before the start, above `length` after the end.
    const dayOf = (date) => start ? daysBetween(start, date) + 1 : null
    const weekOf = (date) => start ? Math.floor((dayOf(date) - 1) / 7) + 1 : null
    // The week a date falls in: the program week once it has a start, otherwise Monday to Sunday.
    const weekFrom = (date) => start ? addDays(start, (weekOf(date) - 1) * 7) : monday(date)
    return { wave, start, length, weeks, dayOf, weekOf, weekFrom }
}

// A wave's results so far (up to today).
function waveSummary(wave, data) {
    const t = today()
    const end = waveEnd(wave)
    const elapsed = Math.min(Math.max(daysBetween(wave.start, t) + 1, 0), wave.length)
    let complete = 0, best = 0, streak = 0, litresTotal = 0
    for (let i = 0; i < elapsed; i++) {
        const day = data.days[addDays(wave.start, i)]
        litresTotal += water(day)
        if (isComplete(day)) { complete++; best = Math.max(best, ++streak) } else streak = 0
    }
    const inWave = (e) => e.date >= wave.start && e.date < end
    return {
        elapsed, complete, best,
        status: t < wave.start ? 'upcoming' : t >= end ? 'done' : 'now',
        km: sum(data.runs.filter(inWave), 'km'),
        drinks: sum(data.drinks.filter(inWave), 'quantity'),
        water: elapsed ? round(litresTotal / elapsed) : 0,
    }
}

// Totals per week: every program week so far, or the last 8 calendar weeks without a start date.
function weeklyTotals(entries, field, program) {
    const t = today()
    const buckets = program.start
        ? Array.from({ length: Math.min(program.weeks, Math.max(1, program.weekOf(t))) },
            (_, i) => ({ label: `W${i + 1}`, from: addDays(program.start, i * 7) }))
        : Array.from({ length: 8 }, (_, i) => {
            const from = addDays(monday(t), (i - 7) * 7)
            return { label: shortDate(from), from }
        })
    return {
        labels: buckets.map(b => b.label),
        values: buckets.map(b => sum(entries.filter(e => e.date >= b.from && e.date < addDays(b.from, 7)), field)),
    }
}

function inProgram(entries, program) {
    if (!program.start) return entries
    const end = addDays(program.start, program.length)
    return entries.filter(e => e.date >= program.start && e.date < end)
}

function thisWeek(entries, program) {
    const from = program.weekFrom(today())
    return entries.filter(e => e.date >= from && e.date < addDays(from, 7))
}

// ---- Shared pieces ----

// The signed-in person, for the name in every header.
const Me = createContext(null)

function Hero({ variant, eyebrow, big, unit, sub, children, aside }) {
    const me = useContext(Me)
    return (
        <header className={cx(styles.hero, variant)}>
            <div className={styles.brand}>SPR{me && ` · ${me.name}`}</div>
            {children}
            <div className={styles.heroRow}>
                <div>
                    <div className={styles.eyebrow}>{eyebrow}</div>
                    <div className={styles.big}>{big}{unit && <small>{unit}</small>}</div>
                    {sub && <div className={styles.heroSub}>{sub}</div>}
                </div>
                {aside}
            </div>
        </header>
    )
}

function Section({ title, count, children, className }) {
    return (
        <section className={cx(styles.section, className)}>
            {(title || count) && (
                <div className={styles.sectionHead}>
                    <h2 className={styles.heading}>{title}</h2>
                    {count && <span className={styles.count}>{count}</span>}
                </div>
            )}
            {children}
        </section>
    )
}

function Stats({ items }) {
    return (
        <div className={styles.stats}>
            {items.map(([label, value]) => (
                <div key={label} className={styles.stat}><p>{label}</p><p>{value}</p></div>
            ))}
        </div>
    )
}

function Field({ label, wide, children }) {
    return <label className={cx(styles.field, wide && styles.wide)}><span>{label}</span>{children}</label>
}

function Ring({ value, max }) {
    const r = 48
    const circumference = 2 * Math.PI * r
    return (
        <div className={styles.ring}>
            <svg viewBox="0 0 112 112" width="112" height="112">
                <circle className={styles.track} cx="56" cy="56" r={r} />
                <circle className={styles.value} cx="56" cy="56" r={r}
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / max)} />
            </svg>
            <div className={styles.ringLabel}>{value}/{max}<span>today</span></div>
        </div>
    )
}

function LogList({ entries, render, onDelete }) {
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
    if (!sorted.length) return null
    return (
        <Section title="History" count={`${sorted.length} logged`}>
            <div className={styles.log}>
                {sorted.map(e => {
                    const [main, detail] = render(e)
                    return (
                        <div key={e.id} className={styles.logRow}>
                            <div className={styles.logDate}>
                                <b>{fmt(e.date, { day: 'numeric' })}</b>
                                <small>{fmt(e.date, { month: 'short' })}</small>
                            </div>
                            <div className={styles.logMain}>
                                <b>{main}</b>
                                <p>{[fmt(e.date, { weekday: 'long' }), detail].filter(Boolean).join(' · ')}</p>
                            </div>
                            <button className={styles.remove} title="Delete" onClick={() => onDelete(e)}><FontAwesomeIcon icon={faXmark} /></button>
                        </div>
                    )
                })}
            </div>
        </Section>
    )
}

// Saves `value` a second after it stops changing, and straight away when the field loses
// focus, the component goes (tab or day switch) or the app is hidden. Only saves real changes.
function useAutosave(value, saved, save, delay = 1000) {
    const latest = useRef()
    latest.current = { value, saved, save }
    const flush = () => {
        const { value, saved, save } = latest.current
        if (JSON.stringify(value) === JSON.stringify(saved)) return
        latest.current.saved = value
        save(value)
    }
    useEffect(() => {
        const timer = setTimeout(flush, delay)
        return () => clearTimeout(timer)
    }, [JSON.stringify(value)])
    useEffect(() => {
        const onHide = () => { if (document.visibilityState === 'hidden') flush() }
        document.addEventListener('visibilitychange', onHide)
        window.addEventListener('pagehide', flush)
        return () => {
            document.removeEventListener('visibilitychange', onHide)
            window.removeEventListener('pagehide', flush)
            flush()
        }
    }, [])
    return flush
}

// Keyed by date, so a note always saves to the day it was typed on.
function NotesField({ saved, save }) {
    const [value, setValue] = useState(saved)
    const flush = useAutosave(value, saved, save)
    return <input className={styles.input} placeholder="How did today go?" value={value} onChange={(e) => setValue(e.target.value)} onBlur={flush} />
}

// ---- Today ----

const CORE = [['abs', 'Abs workout', faDumbbell], ['challenge', 'Challenge', faBolt]]

// Bottom sheet with the full abs workout or challenge, opened from its Core card.
function InstructionsSheet({ field, week, plan, day, toggle, onClose, goToPlan }) {
    const closeRef = useRef(null)
    const [, label, icon] = CORE.find(([f]) => f === field)

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        const overflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeRef.current?.focus()
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = overflow
        }
    }, [])

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={cx(styles.sheet, day[field] && styles.sheetDone)} role="dialog" aria-modal="true" aria-labelledby="spr-sheet-title" onClick={(e) => e.stopPropagation()}>
                <div className={styles.sheetHandle} />
                <div className={styles.sheetHead}>
                    <div>
                        <div className={styles.coreTitle}><FontAwesomeIcon icon={icon} />Week {week}</div>
                        <h2 id="spr-sheet-title" className={styles.heading}>{label}<em>.</em></h2>
                    </div>
                    <button ref={closeRef} className={styles.round} onClick={onClose} aria-label="Close"><FontAwesomeIcon icon={faXmark} /></button>
                </div>
                <div className={styles.sheetText}>{plan[field]}</div>
                <button className={cx(styles.button, styles.full, day[field] ? styles.buttonDone : styles.buttonGhost)} onClick={() => toggle(field)}>
                    {day[field] ? <><FontAwesomeIcon icon={faCheck} /> Done</> : 'Mark done'}
                </button>
                <button className={cx(styles.link, styles.sheetEdit)} onClick={() => { onClose(); goToPlan() }}>Edit in the plan →</button>
            </div>
        </div>
    )
}

function Today({ data, date, setDate, saveDay, goToPlan }) {
    const day = { ...EMPTY_DAY, ...data.days[date] }

    const t = today()
    const wave = waveFor(data.waves, date)
    const nextWave = data.waves.find(w => w.start > date)
    const program = programFor(wave)
    const dayNo = program.dayOf(date)
    const week = program.weekOf(date)
    const plan = (wave && data.plan[wave.id]?.[week]) || {}
    const [sheet, setSheet] = useState(null) // 'abs' | 'challenge' while the instructions are open
    const toggle = (field) => saveDay(date, { [field]: !day[field] })
    const weekCoffee = Array.from({ length: 7 }, (_, i) => coffee(data.days[addDays(date, -i)])).reduce((a, b) => a + b, 0)

    let hero = { eyebrow: 'Start your first wave', big: 'Go.' }
    if (wave) hero = { eyebrow: `${wave.name} · Week ${week} · Day`, big: dayNo, unit: `/${wave.length}` }
    else if (nextWave) {
        const days = daysBetween(date, nextWave.start)
        hero = { eyebrow: `${nextWave.name} starts in`, big: days, unit: days === 1 ? 'day' : 'days' }
    } else if (data.waves.length) hero = { eyebrow: 'Between waves', big: 'Rest.' }

    return (
        <>
            <Hero {...hero}
                sub={isComplete(day) ? 'Day smashed. 💪' : `${mealsDone(day)}/6 meals · ${round(water(day))} L · ${coreDone(day) ? 'core ✓' : 'core'}`}
                aside={<Ring value={score(day)} max={SCORE_MAX} />}>
                <div className={styles.dateNav}>
                    <button className={styles.round} onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <div className={styles.dateLabel}>
                        {date === t ? 'Today' : longDate(date)}
                        {date !== t && <div><button className={styles.todayLink} onClick={() => setDate(t)}>Back to today</button></div>}
                    </div>
                    <button className={styles.round} onClick={() => setDate(addDays(date, 1))} aria-label="Next day"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
            </Hero>

            {!wave && (
                <div className={styles.notice}>
                    <span>{data.waves.length
                        ? "This day isn't in a wave. You can still log it."
                        : 'Start your first wave to unlock weeks, abs workouts and challenges.'}</span>
                    <button className={styles.link} onClick={() => goToPlan('new')}>New wave →</button>
                </div>
            )}

            <Section title={<>Eat<em>.</em></>} count={`${mealsDone(day)} / ${MEALS.length}`}>
                <div className={styles.meals}>
                    {MEALS.map(([field, label]) => (
                        <button key={field} className={cx(styles.meal, day[field] && styles.mealDone)} onClick={() => toggle(field)}>
                            <span className={styles.check}>{day[field] && <FontAwesomeIcon icon={faCheck} />}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </Section>

            <Section title={<>Hydrate<em>.</em> <FontAwesomeIcon icon={faDroplet} style={{ fontSize: '0.7em', color: '#67f5f9' }} /></>} count={waterDone(day) ? 'Goal hit 💧' : `${litres(Math.max(0, WATER_GOAL - water(day)))} to go`}>
                <div className={styles.water}>
                    <div className={styles.waterAmount}>
                        {round(water(day))}<small>/ {WATER_GOAL} L</small>
                    </div>
                    <div className={styles.waterBar}>
                        <div className={cx(styles.waterFill, waterDone(day) && styles.waterFull)} style={{ width: `${Math.min(100, water(day) / WATER_GOAL * 100)}%` }} />
                    </div>
                </div>
                <div className={styles.waterButtons}>
                    <button className={cx(styles.button, styles.buttonGhost, styles.buttonSmall)} disabled={!water(day)} aria-label="Remove 250 ml"
                        onClick={() => saveDay(date, (d) => ({ water: round(Math.max(0, water(d) - 0.25)) }))}>−</button>
                    {WATER_STEPS.map(step => (
                        <button key={step} className={cx(styles.button, styles.buttonRun, styles.buttonSmall)}
                            onClick={() => saveDay(date, (d) => ({ water: round(water(d) + step) }))}>
                            +{step < 1 ? `${step * 1000} ml` : `${step} L`}
                        </button>
                    ))}
                </div>
            </Section>

            <Section title={<>Coffee<em>.</em> <FontAwesomeIcon icon={faMugHot} style={{ fontSize: '0.7em', color: '#c08552' }} /></>}
                count={`Last 7 days: ${cups(weekCoffee)}`}>
                <div className={styles.coffee}>
                    <div className={styles.coffeeCups} aria-label={cups(coffee(day))}>
                        <span className={styles.coffeeCount}>{coffee(day)}</span>
                        <span className={styles.coffeeIcons}>
                            {Array.from({ length: Math.min(coffee(day), 8) }, (_, i) => <FontAwesomeIcon key={i} icon={faMugHot} />)}
                            {coffee(day) > 8 && <b>+{coffee(day) - 8}</b>}
                        </span>
                    </div>
                    <div className={styles.coffeeButtons}>
                        <button className={cx(styles.button, styles.buttonGhost, styles.buttonSmall)} disabled={!coffee(day)} aria-label="Remove a coffee"
                            onClick={() => saveDay(date, (d) => ({ coffee: Math.max(0, coffee(d) - 1) }))}>−</button>
                        <button className={cx(styles.button, styles.buttonCoffee, styles.buttonSmall)}
                            onClick={() => saveDay(date, (d) => ({ coffee: coffee(d) + 1 }))}>+1 Coffee</button>
                    </div>
                </div>
            </Section>

            <Section title={<>Core<em>.</em></>} count="Abs or challenge">
                <div className={styles.core}>
                    {CORE.map(([field, label, icon]) => (
                        <div key={field} className={cx(styles.coreCard, day[field] && styles.coreDone)}>
                            <div className={styles.coreTitle}>
                                <FontAwesomeIcon icon={icon} />{label}
                                {plan[field] && (
                                    <button className={styles.coreExpand} onClick={() => setSheet(field)} aria-label={`Show the full ${label.toLowerCase()}`}>
                                        <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
                                    </button>
                                )}
                            </div>
                            {plan[field] ? (
                                <button className={styles.coreOpen} onClick={() => setSheet(field)}>
                                    <span className={styles.coreText}>{plan[field].replace(/\n\s*\n/g, '\n')}</span>
                                </button>
                            ) : (
                                <div className={styles.coreEmpty}>
                                    {wave
                                        ? <span className={styles.muted}>Nothing planned for week {week} yet. <button className={styles.link} onClick={() => goToPlan(wave.id)}>Add it →</button></span>
                                        : <span className={styles.muted}>Not in a wave. Tick it off when it's done.</span>}
                                </div>
                            )}
                            <button className={cx(styles.button, styles.buttonSmall, day[field] ? styles.buttonDone : styles.buttonGhost)} onClick={() => toggle(field)}>
                                {day[field] ? <><FontAwesomeIcon icon={faCheck} /> Done</> : 'Mark done'}
                            </button>
                        </div>
                    ))}
                </div>
            </Section>

            {sheet && (
                <InstructionsSheet field={sheet} week={week} plan={plan} day={day} toggle={toggle}
                    onClose={() => setSheet(null)} goToPlan={() => goToPlan(wave.id)} />
            )}

            <Section title={<>Notes<em>.</em></>}>
                <NotesField key={date} saved={day.notes} save={(notes) => saveDay(date, { notes })} />
            </Section>

            {wave && <Overview data={data} program={program} date={date} setDate={setDate} />}
        </>
    )
}

function Overview({ data, program, date, setDate }) {
    const t = today()
    const { elapsed, complete, best, status: waveStatus } = waveSummary(program.wave, data)

    // Today still counts as in progress, so the streak runs from yesterday until today is complete.
    let streak = 0
    for (let d = isComplete(data.days[t]) ? t : addDays(t, -1); d >= program.start && isComplete(data.days[d]); d = addDays(d, -1)) streak++

    const status = (d) => {
        const day = data.days[d]
        if (isComplete(day)) return styles.cellComplete
        if (score(day) || water(day)) return styles.cellPartial
        return d < t ? styles.cellMissed : null
    }

    return (
        <Section title={<>Progress<em>.</em></>} count={`${program.wave.name} · ${elapsed} / ${program.length} days`}>
            <Stats items={[['Complete days', complete], waveStatus === 'now' ? ['Streak', `🔥 ${streak}`] : ['Best streak', `🔥 ${best}`]]} />
            <div className={styles.grid}>
                {Array.from({ length: program.weeks }, (_, w) => (
                    <div key={w} className={styles.week}>
                        <span>W{w + 1}</span>
                        {Array.from({ length: 7 }, (_, i) => {
                            const index = w * 7 + i
                            if (index >= program.length) return <span key={i} />
                            const d = addDays(program.start, index)
                            const day = data.days[d]
                            return (
                                <button key={d} onClick={() => setDate(d)}
                                    title={`${longDate(d)}: ${mealsDone(day)}/6 meals, ${litres(water(day))} water, ${cups(coffee(day))} coffee${day?.abs ? ', abs' : ''}${day?.challenge ? ', challenge' : ''}`}
                                    className={cx(styles.cell, status(d), d === t && styles.cellToday, d === date && styles.cellSelected)} />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div className={styles.legend}>
                <span><i className={styles.cellComplete} />Complete</span>
                <span><i className={styles.cellPartial} />Partly done</span>
                <span><i className={styles.cellMissed} />Missed</span>
            </div>
        </Section>
    )
}

// ---- Runs ----

function Runs({ data, program, addEntry, removeEntry }) {
    const [form, setForm] = useState({ date: today(), km: '', time: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const runs = inProgram(data.runs, program)
    const week = thisWeek(data.runs, program)
    const chart = weeklyTotals(data.runs, 'km', program)
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        if (await addEntry('run', form)) setForm(f => ({ ...f, km: '', time: '', notes: '' }))
        setSaving(false)
    }

    return (
        <>
            <Hero variant={styles.heroRun} eyebrow="This week" big={sum(week, 'km')} unit="km"
                sub={`${week.length} ${week.length === 1 ? 'run' : 'runs'} · ${sum(runs, 'km')} km ${program.start ? 'this wave' : 'in total'}`} />

            <Section title={<>Run<em>.</em></>}>
                <form onSubmit={submit}>
                    <div className={styles.fields}>
                        <Field label="Date"><input className={styles.input} type="date" value={form.date} onChange={set('date')} required /></Field>
                        <Field label="Distance (km)"><input className={styles.input} type="number" inputMode="decimal" step="any" min="0.01" placeholder="5.0" value={form.km} onChange={set('km')} required /></Field>
                        <Field label="Time"><input className={styles.input} placeholder="28:30" value={form.time} onChange={set('time')} /></Field>
                        <Field label="Notes"><input className={styles.input} value={form.notes} onChange={set('notes')} /></Field>
                    </div>
                    <button className={cx(styles.button, styles.buttonRun, styles.full)} disabled={saving}>
                        <FontAwesomeIcon icon={faPersonRunning} /> {saving ? 'Saving…' : 'Log run'}
                    </button>
                </form>
            </Section>

            <Section title={<>Stats<em>.</em></>}>
                <Stats items={[
                    [program.start ? 'This wave' : 'Total', `${sum(runs, 'km')} km`],
                    ['Runs', runs.length],
                    ['Longest', runs.length ? `${Math.max(...runs.map(r => r.km))} km` : '–'],
                    ['Average', runs.length ? `${round(sum(runs, 'km') / runs.length)} km` : '–'],
                ]} />
                {data.runs.length > 0 && <SprChart labels={chart.labels} values={chart.values} unit="km" colors={['#4290e9', '#67f5f9']} />}
            </Section>

            <LogList entries={data.runs} onDelete={(e) => removeEntry('run', e)}
                render={(e) => [`${e.km} km`, [e.time, e.notes].filter(Boolean).join(' · ')]} />
        </>
    )
}

// ---- Drinks ----

function Drinks({ data, program, addEntry, removeEntry }) {
    const [form, setForm] = useState({ date: today(), quantity: '1', drink: 'Beer', notes: '' })
    const [saving, setSaving] = useState(false)
    const t = today()
    const drinks = inProgram(data.drinks, program)
    const week = thisWeek(data.drinks, program)
    const chart = weeklyTotals(data.drinks, 'quantity', program)
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    // Most logged drinks first, for the one-tap buttons.
    const favourites = useMemo(() => {
        const counts = {}
        data.drinks.forEach(d => { counts[d.drink] = (counts[d.drink] || 0) + 1 })
        const names = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
        return (names.length ? names : ['Beer']).slice(0, 3)
    }, [data.drinks])

    // Days so far without a drink: in the current wave, or this week between waves.
    const from = program.start || monday(t)
    const elapsed = Math.max(0, Math.min(daysBetween(from, t) + 1, program.start ? program.length : 7))
    const drinkDays = new Set(data.drinks.filter(d => d.date >= from && d.date <= t).map(d => d.date)).size
    const dryDays = Math.max(0, elapsed - drinkDays)

    const add = async (entry) => {
        setSaving(true)
        const ok = await addEntry('drink', entry)
        setSaving(false)
        return ok
    }
    const submit = async (e) => {
        e.preventDefault()
        if (await add(form)) setForm(f => ({ ...f, quantity: '1', notes: '' }))
    }

    return (
        <>
            <Hero variant={styles.heroDrinks} eyebrow="This week" big={sum(week, 'quantity')} unit={sum(week, 'quantity') === 1 ? 'drink' : 'drinks'}
                sub={`${dryDays} of ${elapsed} days dry ${program.start ? 'this wave' : 'this week'}`} />

            <Section title={<>Drinks<em>.</em></>} count={form.date === t ? 'Today' : longDate(form.date)}>
                <div className={styles.chips}>
                    {favourites.map(name => (
                        <button key={name} className={cx(styles.button, styles.buttonSmall)} disabled={saving}
                            onClick={() => add({ date: form.date, quantity: 1, drink: name, notes: '' })}>
                            <FontAwesomeIcon icon={faBeerMugEmpty} /> +1 {name}
                        </button>
                    ))}
                </div>
                <form onSubmit={submit}>
                    <div className={styles.fields}>
                        <Field label="Date"><input className={styles.input} type="date" value={form.date} onChange={set('date')} required /></Field>
                        <Field label="Quantity"><input className={styles.input} type="number" inputMode="decimal" step="any" min="0.1" value={form.quantity} onChange={set('quantity')} required /></Field>
                        <Field label="Drink">
                            <input className={styles.input} list="spr-drinks" value={form.drink} onChange={set('drink')} />
                            <datalist id="spr-drinks">{favourites.map(n => <option key={n} value={n} />)}</datalist>
                        </Field>
                        <Field label="Notes"><input className={styles.input} value={form.notes} onChange={set('notes')} /></Field>
                    </div>
                    <button className={cx(styles.button, styles.buttonGhost, styles.full)} disabled={saving}>{saving ? 'Saving…' : 'Log drinks'}</button>
                </form>
            </Section>

            <Section title={<>Stats<em>.</em></>}>
                <Stats items={[
                    ['Today', sum(data.drinks.filter(d => d.date === t), 'quantity')],
                    [program.start ? 'This wave' : 'Total', sum(drinks, 'quantity')],
                    ['Dry days', `${dryDays} / ${elapsed}`],
                    ['Drinking days', drinkDays],
                ]} />
                {data.drinks.length > 0 && <SprChart labels={chart.labels} values={chart.values} unit="drinks" colors={['#522566', '#df2793']} />}
            </Section>

            <LogList entries={data.drinks} onDelete={(e) => removeEntry('drink', e)}
                render={(e) => [`${e.quantity} × ${e.drink}`, e.notes]} />
        </>
    )
}

// ---- Plan ----

function WaveSettings({ wave, saveWave, canMakeOfficial }) {
    const saved = { name: wave.name, start: wave.start, length: String(wave.length) }
    const [draft, setDraft] = useState(saved)
    const save = (value) => {
        const length = Number(value.length)
        if (!DATE.test(value.start) || !Number.isInteger(length) || length < 1 || length > 365) return
        saveWave(wave.id, { name: value.name, start: value.start, length })
    }
    const flush = useAutosave(draft, saved, save)
    const set = (field) => (e) => setDraft(d => ({ ...d, [field]: e.target.value }))
    return (
        <div className={styles.fields}>
            <Field label="Name" wide><input className={styles.input} value={draft.name} maxLength={40} onChange={set('name')} onBlur={flush} /></Field>
            <Field label="Start date"><input className={styles.input} type="date" value={draft.start} onChange={set('start')} onBlur={flush} /></Field>
            <Field label="Days"><input className={styles.input} type="number" inputMode="numeric" min="1" max="365" value={draft.length} onChange={set('length')} onBlur={flush} /></Field>
            {canMakeOfficial && (
                <label className={cx(styles.toggle, styles.wide)}>
                    <input type="checkbox" checked={wave.official}
                        onChange={(e) => saveWave(wave.id, { name: wave.name, start: wave.start, length: wave.length, official: e.target.checked })} />
                    <span>
                        <b><FontAwesomeIcon icon={faStar} /> Official wave</b>
                        Everyone can copy its abs workouts and challenges into their own waves.
                    </span>
                </label>
            )}
        </div>
    )
}

function WeekEditor({ week, saved, save }) {
    const [draft, setDraft] = useState(saved)
    const flush = useAutosave(draft, saved, (value) => save(week, value))
    const set = (field) => (e) => setDraft(d => ({ ...d, [field]: e.target.value }))
    return (
        <div className={styles.fields}>
            <Field label="Abs workout" wide><textarea className={styles.input} rows="3" value={draft.abs} onChange={set('abs')} onBlur={flush} /></Field>
            <Field label="Challenge" wide><textarea className={styles.input} rows="3" value={draft.challenge} onChange={set('challenge')} onBlur={flush} /></Field>
        </div>
    )
}

const WAVE_STATUS = { now: 'Now', upcoming: 'Upcoming', done: 'Done' }

function WaveCard({ wave, data, active, onClick }) {
    const s = waveSummary(wave, data)
    return (
        <button className={cx(styles.waveCard, active && styles.waveActive)} onClick={onClick} aria-pressed={active}>
            <span className={styles.waveTop}>
                <b>{wave.name}{wave.official && <FontAwesomeIcon icon={faStar} className={styles.officialStar} title="Official" />}</b>
                <span className={cx(styles.tag, s.status !== 'now' && styles.tagMuted)}>{WAVE_STATUS[s.status]}</span>
            </span>
            <span className={styles.muted}>{shortDate(wave.start)} – {fmt(addDays(wave.start, wave.length - 1), { day: 'numeric', month: 'short', year: 'numeric' })} · {wave.length} days</span>
            {s.status !== 'upcoming' && (
                <span className={styles.waveStats}>
                    <span>✓ {s.complete}/{s.elapsed} days</span>
                    <span>🔥 {s.best}</span>
                    <span>{s.km} km</span>
                    <span>{s.drinks} {s.drinks === 1 ? 'drink' : 'drinks'}</span>
                    <span>💧 {s.water} L/day</span>
                </span>
            )}
        </button>
    )
}

function NewWave({ waves, library, onCreate, onCancel }) {
    const last = waves[waves.length - 1]
    // Straight after the last wave if that's still running or ahead, otherwise today.
    const start = last && waveEnd(last) > today() ? waveEnd(last) : today()
    const [form, setForm] = useState({ name: `Wave ${waves.length + 1}`, start, length: String(DEFAULT_LENGTH), copyFrom: last ? String(last.id) : '' })
    const [saving, setSaving] = useState(false)
    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        await onCreate({ ...form, length: Number(form.length), copyFrom: form.copyFrom ? Number(form.copyFrom) : null })
        setSaving(false)
    }

    return (
        <Section title={<>New wave<em>.</em></>}>
            <form onSubmit={submit}>
                <div className={styles.fields}>
                    <Field label="Name" wide><input className={styles.input} value={form.name} maxLength={40} onChange={set('name')} /></Field>
                    <Field label="Start date"><input className={styles.input} type="date" value={form.start} onChange={set('start')} required /></Field>
                    <Field label="Days"><input className={styles.input} type="number" inputMode="numeric" min="1" max="365" value={form.length} onChange={set('length')} required /></Field>
                    {(waves.length > 0 || library.length > 0) && (
                        <Field label="Abs workouts and challenges" wide>
                            <select className={styles.input} value={form.copyFrom} onChange={set('copyFrom')}>
                                <option value="">Start with an empty plan</option>
                                {waves.length > 0 && (
                                    <optgroup label="Your waves">
                                        {[...waves].reverse().map(w => <option key={w.id} value={w.id}>Copy from {w.name}</option>)}
                                    </optgroup>
                                )}
                                {library.length > 0 && (
                                    <optgroup label="Official waves">
                                        {library.map(w => <option key={w.id} value={w.id}>★ Copy {w.name} by {w.owner} ({w.weeks} {w.weeks === 1 ? 'week' : 'weeks'})</option>)}
                                    </optgroup>
                                )}
                            </select>
                        </Field>
                    )}
                </div>
                <div className={styles.formButtons}>
                    {onCancel && <button type="button" className={cx(styles.button, styles.buttonGhost)} onClick={onCancel}>Cancel</button>}
                    <button className={cx(styles.button, styles.grow)} disabled={saving}>{saving ? 'Creating…' : 'Create wave'}</button>
                </div>
            </form>
        </Section>
    )
}

function WaveDetail({ wave, data, saveWave, savePlan, deleteWave }) {
    const program = programFor(wave)
    const current = waveFor([wave], today()) ? program.weekOf(today()) : null
    const plan = data.plan[wave.id] || {}

    return (
        <>
            <Section title={<>{wave.name}<em>.</em></>} count="Saves as you type">
                <WaveSettings wave={wave} saveWave={saveWave} canMakeOfficial={data.me.owner} />
            </Section>

            {Array.from({ length: program.weeks }, (_, i) => i + 1).map(week => (
                <Section key={week} className={week === current ? styles.weekCurrent : null}
                    title={<>Week {week}{week === current && <> <span className={styles.tag}>Now</span></>}</>}
                    count={`${shortDate(addDays(wave.start, (week - 1) * 7))} – ${shortDate(addDays(wave.start, Math.min(week * 7, wave.length) - 1))}`}>
                    <WeekEditor week={week} save={(w, value) => savePlan(wave.id, w, value)}
                        saved={{ abs: plan[week]?.abs || '', challenge: plan[week]?.challenge || '' }} />
                </Section>
            ))}

            <button className={cx(styles.button, styles.buttonGhost, styles.buttonDanger, styles.full)} onClick={() => deleteWave(wave)}>
                Delete {wave.name}
            </button>
        </>
    )
}

// `selected` is a wave id, or 'new' for the new wave form.
function Waves({ data, selected, setSelected, saveWave, createWave, deleteWave, savePlan }) {
    const t = today()
    const running = waveFor(data.waves, t)
    const creating = selected === 'new' || !data.waves.length
    const wave = creating ? null : data.waves.find(w => w.id === selected) || running || data.waves[data.waves.length - 1]

    const create = async (fields) => {
        const id = await createWave(fields)
        if (id) setSelected(id)
    }

    return (
        <>
            <Hero variant={styles.heroPlan} eyebrow="Your waves" big={data.waves.length} unit={data.waves.length === 1 ? 'wave' : 'waves'}
                sub={running ? `${running.name} · week ${programFor(running).weekOf(t)} of ${programFor(running).weeks}` : 'No wave running right now'} />

            {data.waves.length > 0 && (
                <Section title={<>Waves<em>.</em></>} count="Tap to edit">
                    <div className={styles.waveList}>
                        {[...data.waves].reverse().map(w => (
                            <WaveCard key={w.id} wave={w} data={data} active={w.id === wave?.id} onClick={() => setSelected(w.id)} />
                        ))}
                    </div>
                    {!creating && (
                        <button className={cx(styles.button, styles.buttonGhost, styles.full, styles.spaced)} onClick={() => setSelected('new')}>+ New wave</button>
                    )}
                </Section>
            )}

            {creating && <NewWave waves={data.waves} library={data.library} onCreate={create} onCancel={data.waves.length ? () => setSelected(null) : null} />}
            {wave && <WaveDetail key={wave.id} wave={wave} data={data} saveWave={saveWave} savePlan={savePlan} deleteWave={deleteWave} />}
        </>
    )
}

// ---- You and the people you've added ----

function NameField({ saved, save }) {
    const [value, setValue] = useState(saved)
    const flush = useAutosave(value, saved, (name) => name.trim() && save(name.trim()))
    return <input className={styles.input} value={value} maxLength={40} onChange={(e) => setValue(e.target.value)} onBlur={flush} />
}

function Account({ data, renameMe, signOut }) {
    return (
        <Section title={<>You<em>.</em></>} count="Your data is only yours">
            <div className={styles.fields}>
                <Field label="Your name" wide><NameField key={data.me.id} saved={data.me.name} save={renameMe} /></Field>
            </div>
            <button className={cx(styles.button, styles.buttonGhost, styles.full)} onClick={signOut}>Sign out on this device</button>
        </Section>
    )
}

// ---- Admin (the owner only) ----

const linkUrl = (key) => `${window.location.origin}/spr?key=${encodeURIComponent(key)}`

// "2026-10-21 08:15:00" (UTC, from SQLite) -> "3 h ago"
function ago(timestamp) {
    if (!timestamp) return 'never'
    const minutes = Math.round((Date.now() - Date.parse(`${timestamp.replace(' ', 'T')}Z`)) / 60000)
    if (minutes < 60) return minutes < 2 ? 'just now' : `${minutes} min ago`
    if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h ago`
    return `${Math.round(minutes / 1440)} days ago`
}

function PersonCard({ person, isMe, startOpen, updatePerson, removePerson }) {
    const [shown, setShown] = useState(startOpen)
    const [editing, setEditing] = useState(false)
    const [code, setCode] = useState('')
    const [copied, setCopied] = useState(false)
    const url = person.key && linkUrl(person.key)

    const copy = async () => {
        try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { }
    }
    const share = () => navigator.share({ title: 'SPR', text: `Your SPR link, ${person.name}`, url }).catch(() => { })
    const randomCode = () => {
        if (confirm(`Give ${person.name} a new random code? Their current link stops working.`)) updatePerson(person.id, { newKey: true }).then(ok => ok && setShown(true))
    }
    const saveCode = async (e) => {
        e.preventDefault()
        if (!confirm(`Change ${person.name}'s code? Their current link stops working.`)) return
        if (await updatePerson(person.id, { key: code.trim() })) { setEditing(false); setShown(true) }
    }

    const meta = [
        isMe ? 'You · owner' : `Added ${fmt(person.created.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}`,
        `Active ${ago(person.lastSeen)}`,
        `${person.daysLogged} ${person.daysLogged === 1 ? 'day' : 'days'} logged`,
        person.currentWave ? `In ${person.currentWave}` : `${person.waveCount} ${person.waveCount === 1 ? 'wave' : 'waves'}`,
    ]

    return (
        <div className={styles.personCard}>
            <div className={styles.personHead}>
                <NameField key={person.id} saved={person.name} save={(name) => updatePerson(person.id, { name })} />
                {!isMe && <button className={styles.remove} title={`Remove ${person.name}`} onClick={() => removePerson(person)}><FontAwesomeIcon icon={faXmark} /></button>}
            </div>
            <p className={styles.personMeta}>{meta.join(' · ')}</p>

            {url ? (
                <div className={styles.codeRow}>
                    <code className={styles.code}>{shown ? person.key : '•'.repeat(12)}</code>
                    <button className={styles.round} onClick={() => setShown(v => !v)} aria-label={shown ? 'Hide code' : 'Show code'}><FontAwesomeIcon icon={shown ? faEyeSlash : faEye} /></button>
                    <button className={styles.round} onClick={copy} aria-label="Copy link">{copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}</button>
                    {typeof navigator !== 'undefined' && navigator.share && <button className={styles.round} onClick={share} aria-label="Share link"><FontAwesomeIcon icon={faShareNodes} /></button>}
                </div>
            ) : (
                <p className={styles.muted}>{isMe ? 'Set SPR_KEY to see your code here.' : "This code can't be shown (it was made before codes were kept). Give them a new one."}</p>
            )}

            {isMe ? (
                <p className={cx(styles.muted, styles.spaced)}>Your code is SPR_KEY. Change it in Vercel's environment variables.</p>
            ) : editing ? (
                <form className={cx(styles.formButtons, styles.spaced)} onSubmit={saveCode}>
                    <input className={cx(styles.input, styles.grow)} value={code} onChange={(e) => setCode(e.target.value)} placeholder="New code" autoFocus
                        minLength={8} maxLength={64} pattern="[A-Za-z0-9_\-]+" title="8 to 64 letters, numbers, - or _" required />
                    <button className={cx(styles.button, styles.buttonSmall)}>Save</button>
                    <button type="button" className={cx(styles.button, styles.buttonSmall, styles.buttonGhost)} onClick={() => setEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div className={cx(styles.formButtons, styles.spaced)}>
                    <button className={cx(styles.button, styles.buttonSmall, styles.buttonGhost, styles.grow)} onClick={randomCode}>New code</button>
                    <button className={cx(styles.button, styles.buttonSmall, styles.buttonGhost, styles.grow)} onClick={() => { setCode(person.key || ''); setEditing(true) }}>Edit code</button>
                </div>
            )}
        </div>
    )
}

function Admin({ data, addPerson, updatePerson, removePerson }) {
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [added, setAdded] = useState(null) // the person just added, shown with their code

    const add = async (e) => {
        e.preventDefault()
        setSaving(true)
        const personId = await addPerson(name.trim())
        if (personId) { setAdded(personId); setName('') }
        setSaving(false)
    }

    const others = data.people.length - 1
    return (
        <>
            <Hero variant={styles.heroPlan} eyebrow="Admin" big={others} unit={others === 1 ? 'person' : 'people'} sub="Only you see this tab" />

            <Section title={<>Add<em>.</em></>} count="Gets their own private link">
                <form className={styles.formButtons} onSubmit={add}>
                    <input className={cx(styles.input, styles.grow)} placeholder="Name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} required />
                    <button className={styles.button} disabled={saving || !name.trim()}>{saving ? 'Adding…' : 'Add'}</button>
                </form>
            </Section>

            <Section title={<>People<em>.</em></>} count="Tap 👁 to see a code">
                <div className={styles.log}>
                    {[...data.people].sort((a, b) => (b.id === added) - (a.id === added)).map(p => (
                        <PersonCard key={p.id} person={p} isMe={p.id === data.me.id} startOpen={p.id === added}
                            updatePerson={updatePerson} removePerson={removePerson} />
                    ))}
                </div>
            </Section>
        </>
    )
}

// ---- Page ----

export default function Spr() {
    const router = useRouter()
    const [key, setKey] = useState(null)
    const [keyInput, setKeyInput] = useState('')
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [unpaired, setUnpaired] = useState(false)
    const [tab, setTab] = useState('today')
    const [date, setDate] = useState(today)
    const [planWave, setPlanWave] = useState(null) // wave open on the Plan tab, or 'new'
    const [pending, setPending] = useState(0)
    const [status, setStatus] = useState(null) // 'saved' | 'error' once something has been saved
    const queue = useRef(Promise.resolve())
    // Day rows as last stored on the server, and how many saves per day are still on their way.
    const confirmed = useRef({})
    const inFlight = useRef({})
    // Latest days, ahead of React state, so quick taps (like +250 ml twice) build on each other.
    const days = useRef({})

    // Runs and drinks count against the wave running today.
    const program = useMemo(() => programFor(data && waveFor(data.waves, today())), [data?.waves])

    const send = async (method, body, query = '') => {
        let res
        try {
            res = await fetch(`/api/spr${query}`, {
                method,
                headers: { 'Content-Type': 'application/json', ...(key ? { 'x-spr-key': key } : {}) },
                body: body && JSON.stringify(body),
                // Lets a save started as the app is closed still finish.
                keepalive: method !== 'GET',
            })
        } catch {
            throw new Error(method === 'GET' ? 'No connection. Reload once you are back online.' : 'No connection, so that change was not saved.')
        }
        if (res.status === 401) setUnpaired(true)
        if (res.status === 204) return null
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'Request failed')
        return json
    }

    // Report errors in the banner; resolves to false when the request failed.
    const attempt = async (fn) => {
        setError(null)
        try { await fn(); return true } catch (err) { setError(err.message); return false }
    }

    // Every save goes through here, for the Saving… / Saved / Not saved indicator.
    const track = async (fn) => {
        setPending(n => n + 1)
        try {
            await fn()
            setStatus('saved')
            setError(null) // a later save worked, so an older failure no longer applies
            return true
        } catch (err) {
            setError(err.message)
            setStatus('error')
            return false
        } finally {
            setPending(n => n - 1)
        }
    }

    useEffect(() => {
        if (pending || status !== 'saved') return
        const timer = setTimeout(() => setStatus(null), 2000)
        return () => clearTimeout(timer)
    }, [pending, status])

    useEffect(() => {
        if (!router.isReady) return
        const fromUrl = typeof router.query.key === 'string' ? router.query.key : ''
        setKey(loadKey(fromUrl))
        // Through the router: Next restores the original URL over a plain history.replaceState.
        if (fromUrl) router.replace('/spr', undefined, { shallow: true })
        try { const saved = localStorage.getItem(TAB_STORAGE); if ([...TABS, ADMIN_TAB].some(([k]) => k === saved)) setTab(saved) } catch { }
    }, [router.isReady])

    useEffect(() => {
        if (key === null) return
        setUnpaired(false)
        attempt(async () => {
            const body = await send('GET')
            days.current = Object.fromEntries(body.days.map(d => [d.date, d]))
            confirmed.current = days.current
            setData({
                days: days.current,
                runs: body.runs,
                drinks: body.drinks,
                me: body.me,
                people: body.people,
                library: body.library,
                waves: sortWaves(body.waves),
                // { [wave id]: { [week]: { abs, challenge } } }
                plan: body.plan.reduce((plan, p) => ({ ...plan, [p.wave_id]: { ...plan[p.wave_id], [p.week]: p } }), {}),
            })
        })
    }, [key])

    const switchTab = (k) => {
        setTab(k)
        store(TAB_STORAGE, k)
        window.scrollTo({ top: 0 })
    }

    // Saved in order so quick taps never race each other into duplicate rows.
    // `changes` is an object, or a function of the current day returning one.
    const saveDay = (d, changes) => {
        const current = { ...EMPTY_DAY, ...days.current[d] }
        const day = { ...current, ...(typeof changes === 'function' ? changes(current) : changes), date: d }
        days.current = { ...days.current, [d]: day }
        setData(prev => ({ ...prev, days: days.current }))
        inFlight.current[d] = (inFlight.current[d] || 0) + 1
        queue.current = queue.current.then(async () => {
            const ok = await track(async () => {
                confirmed.current = { ...confirmed.current, [d]: await send('PUT', { type: 'day', ...day }) }
            })
            // Once the day's last save has settled, a failure puts back what the server really has.
            if (--inFlight.current[d] === 0 && !ok) {
                const { [d]: _, ...rest } = days.current
                days.current = confirmed.current[d] ? { ...rest, [d]: confirmed.current[d] } : rest
                setData(prev => ({ ...prev, days: days.current }))
            }
        })
    }

    const addEntry = (type, entry) => track(async () => {
        const saved = await send('POST', { type, ...entry })
        const list = `${type}s`
        setData(prev => ({ ...prev, [list]: [...prev[list], saved] }))
    })

    const removeEntry = (type, entry) => {
        const what = type === 'run' ? `${entry.km} km run` : `${entry.quantity} × ${entry.drink}`
        if (!confirm(`Delete ${what} on ${longDate(entry.date)}?`)) return
        track(async () => {
            await send('DELETE', null, `?type=${type}&id=${entry.id}`)
            const list = `${type}s`
            setData(prev => ({ ...prev, [list]: prev[list].filter(x => x.id !== entry.id) }))
        })
    }

    const savePlan = (waveId, week, entry) => track(async () => {
        const saved = await send('PUT', { type: 'plan', wave_id: waveId, week, ...entry })
        setData(prev => ({ ...prev, plan: { ...prev.plan, [waveId]: { ...prev.plan[waveId], [week]: saved } } }))
    })

    const saveWave = (id, fields) => track(async () => {
        const { wave } = await send('PUT', { type: 'wave', id, ...fields })
        setData(prev => ({ ...prev, waves: sortWaves(prev.waves.map(w => w.id === id ? wave : w)) }))
    })

    // Resolves to the new wave's id, or null if it couldn't be created.
    const createWave = async (fields) => {
        let id = null
        await track(async () => {
            const { wave, plan } = await send('POST', { type: 'wave', ...fields })
            setData(prev => ({
                ...prev,
                waves: sortWaves([...prev.waves, wave]),
                plan: { ...prev.plan, [wave.id]: Object.fromEntries(plan.map(p => [p.week, p])) },
            }))
            id = wave.id
        })
        return id
    }

    const deleteWave = (wave) => {
        if (!confirm(`Delete ${wave.name} and its plan? Meals, water, runs and drinks you logged are kept.`)) return
        track(async () => {
            await send('DELETE', null, `?type=wave&id=${wave.id}`)
            setPlanWave(null)
            setData(prev => {
                const { [wave.id]: _, ...plan } = prev.plan
                return { ...prev, waves: prev.waves.filter(w => w.id !== wave.id), plan }
            })
        })
    }

    const renameMe = (name) => track(async () => {
        const me = await send('PUT', { type: 'me', name })
        setData(prev => ({ ...prev, me, people: prev.people.map(p => p.id === me.id ? { ...p, name: me.name } : p) }))
    })

    const signOut = () => {
        if (!confirm('Sign out on this device? You need your link to sign back in.')) return
        store(KEY_STORAGE, '')
        setData(null)
        setKey('')
    }

    // Resolves to the new person's id, or null if they couldn't be added.
    const addPerson = async (name) => {
        let personId = null
        await track(async () => {
            const { person } = await send('POST', { type: 'person', name })
            setData(prev => ({ ...prev, people: [...prev.people, person] }))
            personId = person.id
        })
        return personId
    }

    // Name and/or code ({ newKey: true } or { key }); resolves to whether it saved.
    const updatePerson = (personId, fields) => track(async () => {
        const { person } = await send('PUT', { type: 'person', id: personId, ...fields })
        setData(prev => ({
            ...prev,
            me: person.id === prev.me.id ? { ...prev.me, name: person.name } : prev.me,
            people: prev.people.map(p => p.id === person.id ? person : p),
        }))
    })

    const removePerson = (person) => {
        if (!confirm(`Remove ${person.name} and everything they've logged? This can't be undone.`)) return
        track(async () => {
            await send('DELETE', null, `?type=person&id=${person.id}`)
            setData(prev => ({ ...prev, people: prev.people.filter(p => p.id !== person.id) }))
        })
    }

    const goToPlan = (waveId = null) => {
        setPlanWave(waveId)
        switchTab('plan')
    }

    const pair = (e) => {
        e.preventDefault()
        store(KEY_STORAGE, keyInput.trim())
        setKey(keyInput.trim())
    }

    const props = { data, program, addEntry, removeEntry }

    return (
        <div className={cx(styles.app, montserrat.className)}>
            <Head>
                <title>SPR – 90 Day Plan</title>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#0b0b10" />
            </Head>
            {/* Dark behind iOS overscroll and the page edges, not just the app box. */}
            <style jsx global>{`html, body { background: #0b0b10; }`}</style>

            {(pending > 0 || status) && (
                <div className={cx(styles.saveState, !pending && status === 'error' && styles.saveError)} role="status">
                    {pending > 0 ? 'Saving…' : status === 'error' ? 'Not saved' : <><FontAwesomeIcon icon={faCheck} /> Saved</>}
                </div>
            )}

            <Me.Provider value={data?.me}>
            <main className={styles.main}>
                {!data && (
                    <Hero eyebrow="Eat. Move. Repeat." big="SPR." sub="One wave at a time" />
                )}

                {unpaired && (
                    <Section title={<>Unlock<em>.</em></>}>
                        <form onSubmit={pair}>
                            <div className={styles.fields}>
                                <Field label="Access key" wide>
                                    <input className={styles.input} type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} autoFocus />
                                </Field>
                            </div>
                            <button className={cx(styles.button, styles.full)}>Let's go</button>
                        </form>
                    </Section>
                )}

                {error && (
                    <div className={cx(styles.notice, styles.error, data && styles.toast)} role="alert">
                        <span>{error}</span>
                        <button className={styles.link} onClick={() => setError(null)} aria-label="Dismiss"><FontAwesomeIcon icon={faXmark} /></button>
                    </div>
                )}

                {!data && !unpaired && !error && <div className={styles.loading} />}

                {data && tab === 'today' && <Today data={data} date={date} setDate={setDate} saveDay={saveDay} goToPlan={goToPlan} />}
                {data && tab === 'runs' && <Runs {...props} />}
                {data && tab === 'drinks' && <Drinks {...props} />}
                {data && tab === 'admin' && data.me.owner && (
                    <Admin data={data} addPerson={addPerson} updatePerson={updatePerson} removePerson={removePerson} />
                )}
                {data && tab === 'plan' && (
                    <>
                        <Waves data={data} selected={planWave} setSelected={setPlanWave}
                            saveWave={saveWave} createWave={createWave} deleteWave={deleteWave} savePlan={savePlan} />
                        <Account data={data} renameMe={renameMe} signOut={signOut} />
                    </>
                )}
            </main>
            </Me.Provider>

            {data && (
                <nav className={styles.tabbar}>
                    <div className={styles.tabs}>
                        {(data.me.owner ? [...TABS, ADMIN_TAB] : TABS).map(([k, label, icon]) => (
                            <button key={k} className={cx(styles.tab, tab === k && styles.tabActive)} onClick={() => switchTab(k)}>
                                <FontAwesomeIcon icon={icon} />{label}
                            </button>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    )
}

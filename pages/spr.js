import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Montserrat } from 'next/font/google'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBeerMugEmpty, faBolt, faCalendarDay, faCheck, faChevronLeft, faChevronRight, faDumbbell, faListCheck,
    faDroplet, faPersonRunning, faXmark,
} from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/spr.module.scss'

const SprChart = dynamic(() => import('../components/spr_chart'), { ssr: false })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800', '900'], style: ['normal', 'italic'] })

const KEY_STORAGE = 'spr:key'
const TAB_STORAGE = 'spr:tab'
const TABS = [['today', 'Today', faCalendarDay], ['runs', 'Runs', faPersonRunning], ['drinks', 'Drinks', faBeerMugEmpty], ['plan', 'Plan', faListCheck]]
// Laid out two per row: Meal 1 | Snack 1, Meal 2 | Snack 2, ...
const MEALS = [['meal1', 'Meal 1'], ['snack1', 'Snack 1'], ['meal2', 'Meal 2'], ['snack2', 'Snack 2'], ['meal3', 'Meal 3'], ['snack3', 'Snack 3']]
const EMPTY_DAY = { meal1: false, snack1: false, meal2: false, snack2: false, meal3: false, snack3: false, abs: false, challenge: false, notes: '', water: 0 }
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

function programFor(settings) {
    const start = settings.start || null
    const length = Number(settings.length) || DEFAULT_LENGTH
    const weeks = Math.ceil(length / 7)
    // 1-based; below 1 before the start, above `length` after the end.
    const dayOf = (date) => start ? daysBetween(start, date) + 1 : null
    const weekOf = (date) => start ? Math.floor((dayOf(date) - 1) / 7) + 1 : null
    // The week a date falls in: the program week once it has a start, otherwise Monday to Sunday.
    const weekFrom = (date) => start ? addDays(start, (weekOf(date) - 1) * 7) : monday(date)
    return { start, length, weeks, dayOf, weekOf, weekFrom }
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

function Hero({ variant, eyebrow, big, unit, sub, children, aside }) {
    return (
        <header className={cx(styles.hero, variant)}>
            <div className={styles.brand}>SPR · 90 days</div>
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

function Today({ data, program, date, setDate, saveDay, goToPlan }) {
    const day = { ...EMPTY_DAY, ...data.days[date] }

    const t = today()
    const dayNo = program.dayOf(date)
    const week = program.weekOf(date)
    const inPlan = program.start && dayNo >= 1 && dayNo <= program.length
    const plan = data.plan[week] || {}
    const toggle = (field) => saveDay(date, { [field]: !day[field] })

    let hero = { eyebrow: 'Set your start date', big: 'Go.' }
    if (program.start && dayNo < 1) hero = { eyebrow: 'Starts in', big: 1 - dayNo, unit: 1 - dayNo === 1 ? 'day' : 'days' }
    else if (program.start && dayNo > program.length) hero = { eyebrow: 'Plan complete', big: 'Done.' }
    else if (inPlan) hero = { eyebrow: `Week ${week} · Day`, big: dayNo, unit: `/${program.length}` }

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

            {!program.start && (
                <div className={styles.notice}>
                    <span>Set the day your {DEFAULT_LENGTH} days started to unlock weeks, abs workouts and challenges.</span>
                    <button className={styles.link} onClick={goToPlan}>Plan →</button>
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

            <Section title={<>Core<em>.</em></>} count="Abs or challenge">
                <div className={styles.core}>
                    {[['abs', 'Abs workout', faDumbbell], ['challenge', 'Challenge', faBolt]].map(([field, label, icon]) => (
                        <div key={field} className={cx(styles.coreCard, day[field] && styles.coreDone)}>
                            <div className={styles.coreTitle}><FontAwesomeIcon icon={icon} />{label}</div>
                            <div className={styles.coreText}>
                                {plan[field] || (inPlan
                                    ? <span className={styles.muted}>Nothing planned for week {week} yet. <button className={styles.link} onClick={goToPlan}>Add it</button></span>
                                    : <span className={styles.muted}>Tick it off when it's done.</span>)}
                            </div>
                            <button className={cx(styles.button, styles.buttonSmall, day[field] ? styles.buttonDone : styles.buttonGhost)} onClick={() => toggle(field)}>
                                {day[field] ? <><FontAwesomeIcon icon={faCheck} /> Done</> : 'Mark done'}
                            </button>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title={<>Notes<em>.</em></>}>
                <NotesField key={date} saved={day.notes} save={(notes) => saveDay(date, { notes })} />
            </Section>

            {program.start && <Overview data={data} program={program} date={date} setDate={setDate} />}
        </>
    )
}

function Overview({ data, program, date, setDate }) {
    const t = today()
    const elapsed = Math.min(Math.max(program.dayOf(t), 0), program.length)
    const complete = Array.from({ length: elapsed }, (_, i) => data.days[addDays(program.start, i)]).filter(d => d && isComplete(d)).length

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
        <Section title={<>Progress<em>.</em></>} count={`${elapsed} / ${program.length} days`}>
            <Stats items={[['Complete days', complete], ['Streak', `🔥 ${streak}`]]} />
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
                                    title={`${longDate(d)}: ${mealsDone(day)}/6 meals, ${litres(water(day))} water${day?.abs ? ', abs' : ''}${day?.challenge ? ', challenge' : ''}`}
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
                sub={`${week.length} ${week.length === 1 ? 'run' : 'runs'} · ${sum(runs, 'km')} km ${program.start ? 'in the plan' : 'in total'}`} />

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
                    [program.start ? 'Plan total' : 'Total', `${sum(runs, 'km')} km`],
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

    // Days so far without a drink: in the plan, or this week without a start date.
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
                sub={`${dryDays} of ${elapsed} days dry ${program.start ? 'in the plan' : 'this week'}`} />

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
                    [program.start ? 'Plan total' : 'Total', sum(drinks, 'quantity')],
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

function StartEditor({ program, saveSetting }) {
    const saved = { start: program.start || '', length: String(program.length) }
    const [draft, setDraft] = useState(saved)
    const save = (value) => {
        if (value.start !== saved.start && DATE.test(value.start)) saveSetting('start', value.start)
        const length = Number(value.length)
        if (value.length !== saved.length && Number.isInteger(length) && length >= 1 && length <= 365) saveSetting('length', length)
    }
    const flush = useAutosave(draft, saved, save)
    const set = (field) => (e) => setDraft(d => ({ ...d, [field]: e.target.value }))
    return (
        <div className={styles.fields}>
            <Field label="Start date"><input className={styles.input} type="date" value={draft.start} onChange={set('start')} onBlur={flush} /></Field>
            <Field label="Days"><input className={styles.input} type="number" inputMode="numeric" min="1" max="365" value={draft.length} onChange={set('length')} onBlur={flush} /></Field>
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

function Plan({ data, program, savePlan, saveSetting }) {
    const current = program.weekOf(today())
    const planned = Object.values(data.plan).filter(p => p.abs || p.challenge).length

    return (
        <>
            <Hero variant={styles.heroPlan} eyebrow="Your plan" big={program.weeks} unit="weeks"
                sub={program.start
                    ? `${shortDate(program.start)} – ${shortDate(addDays(program.start, program.length - 1))} · ${planned}/${program.weeks} weeks planned`
                    : 'Pick your start date below'} />

            <Section title={<>Start<em>.</em></>} count="Saves as you type">
                <StartEditor program={program} saveSetting={saveSetting} />
            </Section>

            {Array.from({ length: program.weeks }, (_, i) => i + 1).map(week => (
                <Section key={week} className={week === current ? styles.weekCurrent : null}
                    title={<>Week {week}{week === current && <> <span className={styles.tag}>Now</span></>}</>}
                    count={program.start ? `${shortDate(addDays(program.start, (week - 1) * 7))} – ${shortDate(addDays(program.start, Math.min(week * 7, program.length) - 1))}` : null}>
                    <WeekEditor week={week} save={savePlan}
                        saved={{ abs: data.plan[week]?.abs || '', challenge: data.plan[week]?.challenge || '' }} />
                </Section>
            ))}
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
    const [pending, setPending] = useState(0)
    const [status, setStatus] = useState(null) // 'saved' | 'error' once something has been saved
    const queue = useRef(Promise.resolve())
    // Day rows as last stored on the server, and how many saves per day are still on their way.
    const confirmed = useRef({})
    const inFlight = useRef({})
    // Latest days, ahead of React state, so quick taps (like +250 ml twice) build on each other.
    const days = useRef({})

    const program = useMemo(() => programFor(data?.settings || {}), [data?.settings])

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
        try { const saved = localStorage.getItem(TAB_STORAGE); if (TABS.some(([k]) => k === saved)) setTab(saved) } catch { }
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
                plan: Object.fromEntries(body.plan.map(p => [p.week, p])),
                settings: body.settings,
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

    const savePlan = (week, entry) => track(async () => {
        const saved = await send('PUT', { type: 'plan', week, ...entry })
        setData(prev => ({ ...prev, plan: { ...prev.plan, [week]: saved } }))
    })

    const saveSetting = (name, value) => track(async () => {
        const saved = await send('PUT', { type: 'setting', key: name, value })
        setData(prev => ({ ...prev, settings: { ...prev.settings, [name]: saved.value } }))
    })

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

            <main className={styles.main}>
                {!data && (
                    <Hero eyebrow="Eat. Move. Repeat." big="SPR." sub="Your 90 day plan" />
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

                {data && tab === 'today' && <Today data={data} program={program} date={date} setDate={setDate} saveDay={saveDay} goToPlan={() => switchTab('plan')} />}
                {data && tab === 'runs' && <Runs {...props} />}
                {data && tab === 'drinks' && <Drinks {...props} />}
                {data && tab === 'plan' && <Plan data={data} program={program} savePlan={savePlan} saveSetting={saveSetting} />}
            </main>

            {data && (
                <nav className={styles.tabbar}>
                    <div className={styles.tabs}>
                        {TABS.map(([k, label, icon]) => (
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

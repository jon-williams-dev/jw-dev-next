import Head from 'next/head'
import { useRouter } from 'next/router'
import { Montserrat } from 'next/font/google'
import { useEffect, useState } from 'react'
import { advise, clock, defaultDirection, mapsLink } from '../lib/commute'
import styles from '../styles/commute.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '700', '900'] })

const REFRESH_MS = 5 * 60 * 1000
const DIRECTIONS = [['work', 'To work'], ['home', 'Home']]

// Should I drive to (or from) work right now? Traffic from /api/commute.
export default function Commute() {
  const router = useRouter()
  const demo = router.query.demo ? '&demo=1' : ''
  const [to, setTo] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => { setTo(defaultDirection()) }, [])

  useEffect(() => {
    const id = setInterval(() => document.visibilityState === 'visible' && setTick(t => t + 1), REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!to || !router.isReady) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/commute?to=${to}${demo}`)
      .then(async res => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || 'Couldn’t get the traffic')
        return body
      })
      .then(body => { if (!cancelled) setData(body) })
      .catch(err => { if (!cancelled) { setData(null); setError(err.message) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [to, demo, tick, router.isReady])

  const fresh = data?.to === to ? data : null
  const advice = fresh && advise(fresh.slots, { seed: new Date(fresh.fetchedAt).getMinutes(), to })
  const now = fresh?.slots[0]

  return (
    <div className={`${styles.page} ${montserrat.className} ${advice ? styles[advice.kind] : ''}`}>
      <Head>
        <title>Should I drive now?</title>
        <meta name="description" content="Live traffic between Kiebingen and Tübingen: go now, wait, or don’t bother." />
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.card}>
        <div className={styles.switch} role="tablist" aria-label="Direction">
          {DIRECTIONS.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={to === key}
              className={to === key ? styles.switchActive : ''} onClick={() => setTo(key)}>
              {label}
            </button>
          ))}
        </div>

        {fresh && <p className={styles.route}>{fresh.from} → {fresh.destination}</p>}

        {!fresh && !error && <p className={styles.waiting}>Checking the roads…</p>}
        {error && !fresh && (
          <div className={styles.error}>
            <p>{error}</p>
            <button type="button" onClick={() => setTick(t => t + 1)}>Try again</button>
          </div>
        )}

        {advice && (
          <>
            <h1 className={styles.answer}>{advice.answer}</h1>
            <p className={styles.detail}>{advice.detail}</p>
            <p className={styles.quip}>{advice.quip}</p>
            {advice.routeTip && (
              <a className={styles.tip} href={mapsLink(fresh.origin, fresh.target, advice.routeTip.via)} target="_blank" rel="noopener noreferrer">
                {advice.routeTip.text} <span>Open in Google Maps ›</span>
              </a>
            )}

            <dl className={styles.stats}>
              <div><dt>Now</dt><dd>{now.minutes}<small> min</small></dd></div>
              <div><dt>Clear road</dt><dd>{now.freeMinutes}<small> min</small></dd></div>
              <div><dt>Arrive</dt><dd>{clock(Date.now() + now.minutes * 60000)}</dd></div>
              <div><dt>Via</dt><dd className={styles.via}>{now.route || '–'}<small> · {now.km} km</small></dd></div>
            </dl>

            <Departures slots={fresh.slots} best={advice.best} />

            {now.warnings?.length > 0 && <p className={styles.warning}>{now.warnings.join(' · ')}</p>}

            <p className={styles.footer}>
              {fresh.demo ? 'Made-up traffic (demo)' : 'Traffic by Google'} · updated {clock(fresh.fetchedAt)}
              {loading ? ' · checking…' : <> · <button type="button" onClick={() => setTick(t => t + 1)}>refresh</button></>}
            </p>
          </>
        )}
      </main>
    </div>
  )
}

// Leaving now and later, as bars: the quickest is marked.
function Departures({ slots, best }) {
  const longest = Math.max(...slots.map(s => s.minutes))
  return (
    <section className={styles.departures} aria-label="Drive time by departure">
      <h2>If you leave at…</h2>
      <ol>
        {slots.map(s => (
          <li key={s.offset} className={s.offset === best.offset ? styles.best : ''}>
            <span className={styles.when}>{s.offset ? clock(s.departAt) : 'Now'}</span>
            <span className={styles.bar}><span style={{ width: `${(s.minutes / longest) * 100}%` }} /></span>
            <span className={styles.mins}>{s.minutes} min</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

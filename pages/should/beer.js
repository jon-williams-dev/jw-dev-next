import Head from 'next/head'
import { Montserrat } from 'next/font/google'
import { useEffect, useState } from 'react'
import RunawayNo from '../../components/runaway_no'
import { subjectFor } from '../../lib/should'
import styles from '../../styles/should.module.scss'
import beer from '../../styles/beer.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '800', '900'] })

const ZONE = 'Europe/Berlin' // beer o'clock is German time, wherever you're looking from
const HOUR = 12
const FILL_HOURS = 8 // the glass starts filling this long before beer o'clock
const BUBBLES = 16
const CONFETTI = 40
const TAUNTS = ['Nope', 'Thirsty?', 'Not a chance', 'Last orders!', 'Nice try', 'Cheers anyway', 'Just one', 'Go on']

const LIQUID = '#f5b301'
const HEAD = '#fff8e7'

// Somewhere it's already beer o'clock, for when it isn't here yet.
const CITIES = [
    ['Auckland', 'Pacific/Auckland'], ['Sydney', 'Australia/Sydney'], ['Tokyo', 'Asia/Tokyo'],
    ['Hong Kong', 'Asia/Hong_Kong'], ['Bangkok', 'Asia/Bangkok'], ['Mumbai', 'Asia/Kolkata'],
    ['Dubai', 'Asia/Dubai'], ['Moscow', 'Europe/Moscow'], ['Athens', 'Europe/Athens'],
    ['London', 'Europe/London'], ['Reykjavík', 'Atlantic/Reykjavik'],
    ['Rio', 'America/Sao_Paulo'], ['New York', 'America/New_York'], ['Chicago', 'America/Chicago'],
    ['Denver', 'America/Denver'], ['Los Angeles', 'America/Los_Angeles'], ['Honolulu', 'Pacific/Honolulu'],
]

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const pad = (n) => String(n).padStart(2, '0')
const hourIn = (timeZone, now) => +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now)

// Seconds since midnight in Germany.
function germanSeconds(now) {
    const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23', timeZone: ZONE }).formatToParts(now)
    const part = (type) => +parts.find((p) => p.type === type).value
    return part('hour') * 3600 + part('minute') * 60 + part('second')
}

// The city that most recently hit beer o'clock, so it's the most believable excuse.
function excuse(now) {
    const open = CITIES.map(([city, zone]) => [city, hourIn(zone, now) - HOUR]).filter(([, past]) => past >= 0)
    return open.sort((a, b) => a[1] - b[1])[0]?.[0]
}

export function getServerSideProps({ query }) {
    return { props: { subject: subjectFor(query.name) } }
}

export default function Beer({ subject }) {
    // The clock only runs in the browser, so nothing time-based renders on the server.
    const [now, setNow] = useState(null)
    const [stage, setStage] = useState('clock') // clock → cheers
    const [dodges, setDodges] = useState(0)

    useEffect(() => {
        setNow(new Date())
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Random, so they're only drawn once the clock is running in the browser.
    const [bubbleStyles] = useState(() => Array.from({ length: BUBBLES }, () => ({
        left: `${8 + Math.random() * 84}%`,
        width: `${4 + Math.random() * 6}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
    })))

    const title = subject === 'I' ? "Is it beer o'clock?" : `Is it beer o'clock, ${subject}?`

    let answer, detail, fill = 0
    if (now) {
        const left = HOUR * 3600 - germanSeconds(now)
        if (left <= 0) {
            answer = 'yes'
            detail = "It's past midday in Germany. Don't let it get warm."
            fill = 1
        } else {
            answer = 'no'
            detail = { h: pad(Math.floor(left / 3600)), m: pad(Math.floor(left / 60) % 60), s: pad(left % 60) }
            fill = Math.max(0.04, 1 - left / (FILL_HOURS * 3600))
        }
    }
    const city = answer === 'no' && excuse(now)

    const glass = (
        <div className={beer.glass} style={{ '--liquid': LIQUID, '--head': HEAD }} aria-hidden="true">
            <div className={beer.liquid} style={{ height: `${fill * 88}%` }}>
                {fill > 0 && <div className={beer.head} />}
                {now && bubbleStyles.map((style, i) => <span key={i} className={beer.bubble} style={style} />)}
            </div>
        </div>
    )

    return (
        <div className={`${styles.page} ${beer.page} ${montserrat.className}`}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="How long until the most important time of day?" />
                <meta property="og:title" content={`🍺 ${title}`} />
                <meta property="og:description" content="How long until the most important time of day?" />
            </Head>

            {stage === 'cheers' ? (
                <main className={styles.card}>
                    <div className={styles.emoji}>🍻</div>
                    <h1 className={styles.question}>{subject === 'I' ? 'Cheers!' : `Cheers, ${subject}!`}</h1>
                    <button className={styles.again} onClick={() => { setStage('clock'); setDodges(0) }}>Another round</button>
                    <div className={styles.confetti} aria-hidden="true">
                        {Array.from({ length: CONFETTI }, (_, i) => (
                            <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${2.5 + Math.random() * 2}s` }}>
                                {pick(['🍺', '🍻', '🎉', '🥨'])}
                            </span>
                        ))}
                    </div>
                </main>
            ) : (
                <main className={styles.card}>
                    <p className={beer.kicker}>{title}</p>
                    {glass}

                    {answer === 'yes' && (
                        <>
                            <h1 className={`${styles.question} ${beer.answer}`}>Yes! It's beer o'clock!</h1>
                            <p className={styles.sub}>{detail}</p>
                            <p className={beer.ask}>{subject === 'I' ? 'Should I have one?' : `Should ${subject} have one?`}</p>
                            <div className={styles.buttons}>
                                <button className={styles.yes} style={{ transform: `scale(${Math.min(1 + dodges * 0.08, 1.8)})` }} onClick={() => setStage('cheers')}>
                                    Yes
                                </button>
                                <RunawayNo className={styles.no} taunts={TAUNTS} onDodge={() => setDodges((n) => n + 1)} />
                            </div>
                        </>
                    )}

                    {answer === 'no' && (
                        <>
                            <h1 className={`${styles.question} ${beer.answer}`}>Not yet.</h1>
                            <div className={beer.countdown}>
                                {[['h', 'Hours'], ['m', 'Minutes'], ['s', 'Seconds']].map(([k, label]) => (
                                    <div key={k}>
                                        <strong>{detail[k]}</strong>
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                            {city && <p className={styles.sub}>But it's already beer o'clock in {city}…</p>}
                        </>
                    )}

                </main>
            )}
        </div>
    )
}

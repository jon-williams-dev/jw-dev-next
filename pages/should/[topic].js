import Head from 'next/head'
import { Montserrat } from 'next/font/google'
import { useState } from 'react'
import RunawayNo from '../../components/runaway_no'
import { QUESTIONS, subjectFor } from '../../lib/should'
import styles from '../../styles/should.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '800', '900'] })

const CONFETTI = 40

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Server-rendered so a shared link (/should/motorbike?name=Jon) previews with the name in it.
export function getServerSideProps({ params, query }) {
    if (!QUESTIONS[params.topic]) return { notFound: true }
    return { props: { topic: params.topic, subject: subjectFor(query.name) } }
}

export default function Should({ topic, subject }) {
    const q = QUESTIONS[topic]
    const [dodges, setDodges] = useState(0)
    const [said, setSaid] = useState(false)

    const title = q.question(subject)

    return (
        <div className={`${styles.page} ${montserrat.className}`}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="There is only one right answer." />
                <meta property="og:title" content={`${q.emoji} ${title}`} />
                <meta property="og:description" content="There is only one right answer." />
            </Head>

            {said ? (
                <main className={styles.card}>
                    <div className={styles.emoji}>{q.emoji}</div>
                    <h1 className={styles.question}>{q.yes(subject)}</h1>
                    <button className={styles.again} onClick={() => { setSaid(false); setDodges(0) }}>Ask again</button>
                    <div className={styles.confetti} aria-hidden="true">
                        {Array.from({ length: CONFETTI }, (_, i) => (
                            <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${2.5 + Math.random() * 2}s` }}>
                                {pick(q.confetti)}
                            </span>
                        ))}
                    </div>
                </main>
            ) : (
                <main className={styles.card}>
                    <div className={styles.emoji}>{q.emoji}</div>
                    <h1 className={styles.question}>{title}</h1>
                    <div className={styles.buttons}>
                        <button className={styles.yes} style={{ transform: `scale(${Math.min(1 + dodges * 0.08, 1.8)})` }} onClick={() => setSaid(true)}>
                            Yes
                        </button>
                        <RunawayNo className={styles.no} taunts={q.taunts} onDodge={() => setDodges((n) => n + 1)} />
                    </div>
                </main>
            )}
        </div>
    )
}

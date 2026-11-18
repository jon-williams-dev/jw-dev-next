import Head from 'next/head'
import { Montserrat } from 'next/font/google'
import { useState } from 'react'
import CrispsPacket from '../../components/crisps_packet'
import RunawayNo from '../../components/runaway_no'
import { QUESTIONS, subjectFor } from '../../lib/should'
import styles from '../../styles/should.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '800', '900'] })

const CONFETTI = 40

// Pictures for topics whose emoji won't do; the emoji is still used in link previews.
const ART = { crisps: CrispsPacket }

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Server-rendered so a shared link (/should/motorbike?name=Jon) previews with the name in it.
export function getServerSideProps({ params, query }) {
    if (!QUESTIONS[params.topic]) return { notFound: true }
    return { props: { topic: params.topic, subject: subjectFor(query.name) } }
}

export default function Should({ topic, subject }) {
    const q = QUESTIONS[topic]
    const [dodges, setDodges] = useState(0)
    const [said, setSaid] = useState(null) // 'yes' or 'no' once answered
    const [nag, setNag] = useState(0) // how many of q.nags Yes has got through

    const title = q.question(subject)
    const Art = ART[topic]
    const picture = <div className={styles.emoji}>{Art ? <Art className={styles.art} /> : q.emoji}</div>
    const nagging = q.nags && nag > 0 ? q.nags[nag - 1] : null
    const reset = () => { setSaid(null); setDodges(0); setNag(0) }
    const sayYes = () => (q.nags && nag < q.nags.length ? setNag(nag + 1) : setSaid('yes'))

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
                    {picture}
                    <h1 className={styles.question}>{q[said](subject)}</h1>
                    <button className={styles.again} onClick={reset}>Ask again</button>
                    <div className={styles.confetti} aria-hidden="true">
                        {Array.from({ length: CONFETTI }, (_, i) => (
                            <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${2.5 + Math.random() * 2}s` }}>
                                {pick(said === 'no' ? q.noConfetti : q.confetti)}
                            </span>
                        ))}
                    </div>
                </main>
            ) : (
                <main className={styles.card}>
                    {picture}
                    <h1 className={styles.question}>{nagging ? nagging.ask : title}</h1>
                    {q.nags ? (
                        // Each nag makes No a little more tempting and Yes a little smaller.
                        <div className={styles.buttons} key={nag}>
                            <button className={styles.no} style={{ transform: `scale(${Math.max(1 - nag * 0.08, 0.6)})` }} onClick={sayYes}>
                                {nagging ? nagging.yes : 'Yes'}
                            </button>
                            <button className={styles.yes} style={{ transform: `scale(${1 + nag * 0.12})` }} onClick={() => setSaid('no')}>
                                {nagging ? nagging.no : 'No'}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.buttons}>
                            <button className={styles.yes} style={{ transform: `scale(${Math.min(1 + dodges * 0.08, 1.8)})` }} onClick={() => setSaid('yes')}>
                                Yes
                            </button>
                            <RunawayNo className={styles.no} taunts={q.taunts} onDodge={() => setDodges((n) => n + 1)} />
                        </div>
                    )}
                </main>
            )}
        </div>
    )
}

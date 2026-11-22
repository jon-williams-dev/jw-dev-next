import Head from 'next/head'
import { Montserrat } from 'next/font/google'
import { useEffect, useState } from 'react'
import { JOKES } from '../../lib/jokes'
import styles from '../../styles/should.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '800', '900'] })

const PUNCHLINE_MS = 2200 // the pause before the punchline; a tap skips it

// The jokes in a random order, so none comes round again until they've all been told.
function shuffled() {
    const order = JOKES.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
}

export default function Joke() {
    // Picked in the browser only, so the server and the page never disagree on which joke it is.
    const [deck, setDeck] = useState(null)
    const [told, setTold] = useState(0)
    const [revealed, setRevealed] = useState(false)

    useEffect(() => setDeck(shuffled()), [])

    useEffect(() => {
        if (!deck || revealed) return
        const timer = setTimeout(() => setRevealed(true), PUNCHLINE_MS)
        return () => clearTimeout(timer)
    }, [deck, told, revealed])

    const next = () => {
        if (told + 1 >= deck.length) {
            // Start a fresh order, but not with the joke that was just told.
            const fresh = shuffled()
            if (fresh[0] === deck[told]) fresh.push(fresh.shift())
            setDeck(fresh)
            setTold(0)
        } else {
            setTold(told + 1)
        }
        setRevealed(false)
    }

    const [setup, punchline] = deck ? JOKES[deck[told]] : ['', '']

    return (
        <div className={`${styles.page} ${montserrat.className}`}>
            <Head>
                <title>Tell me a joke</title>
                <meta name="description" content="A new joke every time you ask." />
                <meta property="og:title" content="😂 Tell me a joke" />
                <meta property="og:description" content="A new joke every time you ask." />
            </Head>

            <main className={styles.card} onClick={() => deck && !revealed && setRevealed(true)}>
                <div className={styles.emoji} aria-hidden="true">{revealed ? '😂' : '🤔'}</div>
                {deck && (
                    <>
                        <h1 key={`q${told}`} className={`${styles.question} ${styles.setup}`}>{setup}</h1>
                        <p className={styles.punchline} aria-live="polite">
                            {revealed ? <span key={`a${told}`}>{punchline}</span> : <span className={styles.thinking}>…</span>}
                        </p>
                        <button className={styles.again} onClick={(e) => { e.stopPropagation(); next() }}>Tell me another</button>
                    </>
                )}
            </main>
        </div>
    )
}

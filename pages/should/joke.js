import Head from 'next/head'
import { Montserrat } from 'next/font/google'
import { useEffect, useState } from 'react'
import { JOKE_SETS } from '../../lib/jokes'
import styles from '../../styles/should.module.scss'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '800', '900'] })

const PUNCHLINE_MS = 2200 // the pause before the punchline; a tap skips it

const WORDS = {
    en: { another: 'Tell me another' },
    de: { another: 'Noch einen, bitte', note: 'Lachen ist erlaubt. Wahrscheinlich.' },
}

// The jokes in a random order, so none comes round again until they've all been told.
function shuffled(jokes) {
    const order = jokes.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
}

export default function Joke() {
    const [setId, setSetId] = useState('classic')
    const [askingDe, setAskingDe] = useState(false)
    // Picked in the browser only, so the server and the page never disagree on which joke it is.
    const [deck, setDeck] = useState(null)
    const [told, setTold] = useState(0)
    const [revealed, setRevealed] = useState(false)

    const set = JOKE_SETS.find((s) => s.id === setId)
    const words = WORDS[set.lang]
    const englishSets = JOKE_SETS.filter((s) => s.lang === 'en')

    useEffect(() => {
        setDeck(shuffled(set.jokes))
        setTold(0)
        setRevealed(false)
    }, [set])

    useEffect(() => {
        if (!deck || revealed || askingDe) return
        const timer = setTimeout(() => setRevealed(true), PUNCHLINE_MS)
        return () => clearTimeout(timer)
    }, [deck, told, revealed, askingDe])

    const next = () => {
        if (told + 1 >= deck.length) {
            // Start a fresh order, but not with the joke that was just told.
            const fresh = shuffled(set.jokes)
            if (fresh[0] === deck[told]) fresh.push(fresh.shift())
            setDeck(fresh)
            setTold(0)
        } else {
            setTold(told + 1)
        }
        setRevealed(false)
    }

    const chooseLang = (lang) => {
        if (lang === set.lang) return
        if (lang === 'de') setAskingDe(true)
        else setSetId('classic')
    }

    const joke = deck && set.jokes[deck[told]]
    const [setup, punchline] = joke || ['', '']

    return (
        <div className={`${styles.page} ${montserrat.className}`}>
            <Head>
                <title>Tell me a joke</title>
                <meta name="description" content="A new joke every time you ask." />
                <meta property="og:title" content="😂 Tell me a joke" />
                <meta property="og:description" content="A new joke every time you ask." />
            </Head>

            <main className={styles.card} onClick={() => joke && !revealed && !askingDe && setRevealed(true)}>
                <div className={styles.pickers} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.chips} role="group" aria-label="Language">
                        <button type="button" aria-pressed={set.lang === 'en' && !askingDe} onClick={() => chooseLang('en')}>🇬🇧 English</button>
                        <button type="button" aria-pressed={set.lang === 'de' || askingDe} onClick={() => chooseLang('de')}>🇩🇪 Deutsch</button>
                    </div>
                    {set.lang === 'en' && !askingDe && (
                        <div className={`${styles.chips} ${styles.chipsSmall}`} role="group" aria-label="Kind of joke">
                            {englishSets.map((s) => (
                                <button key={s.id} type="button" aria-pressed={s.id === setId} onClick={() => setSetId(s.id)}>{s.name}</button>
                            ))}
                        </div>
                    )}
                </div>

                {askingDe ? (
                    <>
                        <div className={styles.emoji} aria-hidden="true">🧐</div>
                        <h1 className={styles.question}>German jokes? Are you sure?</h1>
                        <p className={styles.sub}>
                            German humour is no laughing matter. Proceed at your own risk.
                        </p>
                        <div className={styles.buttons}>
                            <button type="button" className={styles.yes} onClick={() => { setAskingDe(false); setSetId('witze') }}>Ja, ganz sicher</button>
                            <button type="button" className={styles.no} onClick={() => setAskingDe(false)}>No, keep it English</button>
                        </div>
                    </>
                ) : joke && (
                    <>
                        <div className={styles.emoji} aria-hidden="true">{revealed ? '😂' : '🤔'}</div>
                        {Array.isArray(setup) ? (
                            <h1 key={`q${setId}${told}`} className={`${styles.question} ${styles.setup} ${styles.dialogue}`}>
                                {setup.map((line, i) => <span key={i}>{line}</span>)}
                            </h1>
                        ) : (
                            <h1 key={`q${setId}${told}`} className={`${styles.question} ${styles.setup}`}>{setup}</h1>
                        )}
                        <p className={styles.punchline} aria-live="polite">
                            {revealed ? <span key={`a${setId}${told}`}>{punchline}</span> : <span className={styles.thinking}>…</span>}
                        </p>
                        <button className={styles.again} onClick={(e) => { e.stopPropagation(); next() }}>{words.another}</button>
                        {words.note && <p className={styles.footnote}>{words.note}</p>}
                    </>
                )}
            </main>
        </div>
    )
}

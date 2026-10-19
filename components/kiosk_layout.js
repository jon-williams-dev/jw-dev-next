import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/stauperle.module.scss'

export const KIOSK_HOME = '/stauperle13'
// Subpages fall back to the home screen after this long without a touch.
const IDLE_MS = 2 * 60 * 1000

const memory = {}

// Device settings picked up once from the URL (?key=...&kiosk=1), then remembered
// on the device and stripped from the address bar.
function deviceSetting(name) {
  const storageKey = `stauperle13:${name}`
  const fromUrl = new URLSearchParams(window.location.search).get(name)
  if (fromUrl !== null) {
    setDeviceSetting(name, fromUrl)
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    window.history.replaceState(window.history.state, '', url)
  }
  if (memory[name] !== undefined) return memory[name]
  try { memory[name] = localStorage.getItem(storageKey) } catch { }
  return memory[name] ?? null
}

function setDeviceSetting(name, value) {
  memory[name] = value || null
  try {
    if (value) localStorage.setItem(`stauperle13:${name}`, value)
    else localStorage.removeItem(`stauperle13:${name}`)
  } catch { }
}

// The key pairs a device (Pi or desktop browser) with the private APIs, e.g. the calendar.
export const kioskKey = () => deviceSetting('key')
export const setKioskKey = (key) => setDeviceSetting('key', key.trim())

// Kiosk mode (hidden cursor, no text selection or context menu, idle return to home)
// is only for the hallway screen: open it once with ?kiosk=1. ?kiosk=0 turns it off.
const isKioskMode = () => deviceSetting('kiosk') === '1'

export function kioskFetch(url) {
  const key = kioskKey()
  return fetch(url, { headers: key ? { 'x-kiosk-key': key } : {} })
}

function Clock() {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Rendered client-side only so server and kiosk clocks never disagree on hydrate.
  if (!now) return <div className={styles.clock} />

  return (
    <div className={styles.clock}>
      <span className={styles.time}>
        {now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className={styles.date}>
        {now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
    </div>
  )
}

export default function KioskLayout({ title, children, home }) {
  const router = useRouter()
  const [kioskMode, setKioskMode] = useState(false)

  useEffect(() => {
    kioskKey()
    setKioskMode(isKioskMode())
  }, [])

  useEffect(() => {
    if (home || !kioskMode) return
    let timer
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => router.push(KIOSK_HOME), IDLE_MS)
    }
    const events = ['pointerdown', 'touchstart', 'keydown']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [home, kioskMode, router])

  // Long-press on a touchscreen opens the context menu; nothing useful lives there.
  useEffect(() => {
    if (!kioskMode) return
    const block = e => e.preventDefault()
    window.addEventListener('contextmenu', block)
    return () => window.removeEventListener('contextmenu', block)
  }, [kioskMode])

  return (
    <div className={`${styles.kiosk} ${kioskMode ? styles.kioskMode : ''}`}>
      <Head>
        <title>{title ? `${title} · Stauperle 13` : 'Stauperle 13'}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f1720" />
      </Head>

      <header className={styles.header}>
        {home ? (
          <div className={styles.brand}>Stauperle 13</div>
        ) : (
          <Link href={KIOSK_HOME} className={styles.back}>
            <span aria-hidden="true">‹</span> Home
          </Link>
        )}
        {title && !home && <div className={styles.pageTitle}>{title}</div>}
        <Clock />
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  )
}

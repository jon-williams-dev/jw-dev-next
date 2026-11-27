import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PowerIcon } from './kiosk_icons'
import styles from '../styles/stauperle.module.scss'

export const KIOSK_HOME = '/stauperle13'
// Subpages fall back to the home screen after this long without a touch.
const IDLE_MS = 2 * 60 * 1000
// Touches inside an embedded page (iframe) don't reach this window, so overlays report them.
export const KIOSK_ACTIVITY = 'stauperle13:activity'

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
export const isKioskMode = () => deviceSetting('kiosk') === '1'

export function kioskFetch(url, options = {}) {
  const key = kioskKey()
  return fetch(url, { ...options, headers: { ...options.headers, ...(key ? { 'x-kiosk-key': key } : {}) } })
}

// Asks for the family key when an API answers 401 { code: 'unpaired' }.
export function PairForm({ onPaired, className = styles.pair }) {
  const [value, setValue] = useState('')
  const rejected = Boolean(kioskKey())

  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setKioskKey(value)
    onPaired()
  }

  return (
    <form className={className} onSubmit={submit}>
      <input
        type="password"
        autoComplete="current-password"
        placeholder={rejected ? 'Key not accepted, try again' : 'Key'}
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
      />
      <button type="submit">Unlock</button>
    </form>
  )
}

const DRAG_PX = 8
const SCROLLS = /(auto|scroll)/

// The nearest panel that scrolls along `axis` ('x' or 'y'), so a drag over a sideways-scrolling
// strip (e.g. a zoomed chart) inside a page that scrolls down still moves both.
function scrollableParent(el, axis) {
  const doc = el.ownerDocument
  for (; el && el !== doc.body; el = el.parentElement) {
    const style = doc.defaultView.getComputedStyle(el)
    if (axis === 'y' ? SCROLLS.test(style.overflowY) && el.scrollHeight > el.clientHeight
      : SCROLLS.test(style.overflowX) && el.scrollWidth > el.clientWidth) return el
  }
  // A plain page that scrolls as a whole, e.g. /varta in the Sunbank overlay.
  const page = doc.scrollingElement
  return page && (axis === 'y' ? page.scrollHeight > page.clientHeight : page.scrollWidth > page.clientWidth) ? page : null
}

// Some Pi touchscreens reach Chromium as a mouse, so a swipe never scrolls (and with the
// scrollbars hidden there is nothing to grab). A mouse drag in `win` scrolls the panel under it.
// Returns a function that stops it.
export function dragToScroll(win) {
  let drag = null

  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !e.target.ownerDocument) return
    const across = scrollableParent(e.target, 'x')
    const upDown = scrollableParent(e.target, 'y')
    drag = (across || upDown) && { across, upDown, x: e.clientX, y: e.clientY, left: across?.scrollLeft, top: upDown?.scrollTop, moved: false }
  }
  const move = (e) => {
    if (!drag) return
    if (!(e.buttons & 1)) return (drag = null)
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_PX) return
    drag.moved = true
    if (drag.across) drag.across.scrollLeft = drag.left - dx
    if (drag.upDown) drag.upDown.scrollTop = drag.top - dy
  }
  // A drag that scrolled shouldn't also tap whatever it ended on.
  const up = () => {
    if (!drag?.moved) return (drag = null)
    drag = null
    const swallow = (e) => { e.preventDefault(); e.stopPropagation() }
    win.addEventListener('click', swallow, { capture: true, once: true })
    setTimeout(() => win.removeEventListener('click', swallow, { capture: true }), 0)
  }

  win.addEventListener('pointerdown', down)
  win.addEventListener('pointermove', move)
  win.addEventListener('pointerup', up)
  win.addEventListener('pointercancel', up)
  return () => {
    win.removeEventListener('pointerdown', down)
    win.removeEventListener('pointermove', move)
    win.removeEventListener('pointerup', up)
    win.removeEventListener('pointercancel', up)
  }
}

function useDragScroll(enabled) {
  useEffect(() => (enabled ? dragToScroll(window) : undefined), [enabled])
}

const CONFIRM_MS = 5 * 1000

// Restarts the Pi (/api/reboot). Tap once to arm, again within a few seconds to restart.
function RestartButton() {
  const [state, setState] = useState('idle') // idle → confirm → restarting, or an error message

  useEffect(() => {
    if (state === 'idle' || state === 'restarting') return
    const id = setTimeout(() => setState('idle'), CONFIRM_MS)
    return () => clearTimeout(id)
  }, [state])

  const tap = async () => {
    if (state === 'restarting') return
    if (state !== 'confirm') return setState('confirm')
    setState('restarting')
    try {
      const res = await kioskFetch('/api/reboot', { method: 'POST' })
      if (!res.ok) setState((await res.json().catch(() => ({}))).error || 'Could not restart')
    } catch {
      setState('Could not restart')
    }
  }

  // Just the icon until tapped; then it says what happens next.
  const label = { idle: null, confirm: 'Tap again to restart', restarting: 'Restarting…' }[state] ?? state
  return (
    <button type="button" aria-label="Restart" className={`${styles.power} ${state === 'confirm' ? styles.restartConfirm : ''}`} onClick={tap}>
      <PowerIcon />
      {label && <span>{label}</span>}
    </button>
  )
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

export default function KioskLayout({ title, children, home, actions }) {
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
    const events = ['pointerdown', 'touchstart', 'keydown', KIOSK_ACTIVITY]
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

  useDragScroll(kioskMode)

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
        {actions}
        {home && kioskMode && <RestartButton />}
        <Clock />
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  )
}

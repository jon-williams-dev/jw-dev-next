import { useEffect } from 'react'
import { KIOSK_ACTIVITY, dragToScroll, isKioskMode } from './kiosk_layout'
import { CloseIcon } from './kiosk_icons'
import styles from '../styles/stauperle.module.scss'

// Kiosk behaviour for the page inside, which knows nothing about the hallway screen.
const KIOSK_CSS = '*, *::before, *::after { cursor: none !important; } html { user-select: none; -webkit-user-select: none; }'

// Another page of the site (e.g. /varta) over the kiosk, full screen, with a big Close button.
export default function KioskOverlay({ title, src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Runs for every page loaded in the frame. Its listeners go when that page does.
  const onLoad = (e) => {
    const win = e.currentTarget.contentWindow
    if (!win) return
    // Keep the kiosk's idle timer from sending it home while someone uses the page.
    const reportActivity = () => window.dispatchEvent(new Event(KIOSK_ACTIVITY))
    for (const name of ['pointerdown', 'touchstart', 'keydown']) win.addEventListener(name, reportActivity, { passive: true })

    if (!isKioskMode()) return
    const style = win.document.createElement('style')
    style.textContent = KIOSK_CSS
    win.document.head.appendChild(style)
    win.addEventListener('contextmenu', (event) => event.preventDefault())
    dragToScroll(win)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.overlayBar}>
        <span className={styles.overlayTitle}>{title}</span>
        <button type="button" className={styles.overlayClose} onClick={onClose}>
          <CloseIcon /> Close
        </button>
      </div>
      <iframe className={styles.overlayFrame} src={src} title={title} onLoad={onLoad} />
    </div>
  )
}

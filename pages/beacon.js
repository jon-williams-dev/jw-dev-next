import Head from 'next/head'
import Image from 'next/image'
import { Poppins, Inter } from 'next/font/google'
import { useState, useEffect, useRef } from 'react'
import styles from '../styles/beacon.module.scss'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// ── Flat SVG icons ────────────────────────────────────────────────────────────

const IcoLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
)
const IcoPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <circle cx="12" cy="17.5" r="0.8" fill="rgba(255,255,255,0.7)" stroke="none" />
  </svg>
)
const IcoZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="none" aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-11h-7l1-9z" />
  </svg>
)
const IcoSparkle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" stroke="none" aria-hidden="true">
    <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.5 2.4-7.4L2 9.6h7.6L12 2z" />
  </svg>
)
const IcoFlame = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#14B8A6" stroke="none" aria-hidden="true">
    <path d="M12 2C8 8 6 11.5 6 14.5a6 6 0 0012 0C18 11.5 16 8 12 2zm0 15.5a2.5 2.5 0 01-2.5-2.5c0-1.8 1-3.3 2.5-5.5 1.5 2.2 2.5 3.7 2.5 5.5a2.5 2.5 0 01-2.5 2.5z" />
  </svg>
)
const IcoBulb = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18h6M11 22h2M8.5 14.2C7 13 6 11.1 6 9a6 6 0 0112 0c0 2.1-1 4-2.5 5.2L15 17H9l-.5-2.8z" />
  </svg>
)
const IcoCoin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v1M12 16v1M14.5 9.5a2.5 2.5 0 00-5 0 2.5 2.5 0 005 0M9.5 14.5a2.5 2.5 0 005 0" />
  </svg>
)
const IcoTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 4h10v7a5 5 0 01-10 0V4z" />
    <path d="M7 7H4v2a3 3 0 003 3M17 7h3v2a3 3 0 01-3 3M12 16v4M9 20h6" />
  </svg>
)
const IcoApple = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.4.82 3.22.82.88 0 2.52-.97 4.14-.83 1.13.09 3.6.75 4.1 3.64-3.86 2.03-3.94 6.59 0 8.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)
const IcoStarSm = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)
const IcoAndroid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.18 15.64a1.1 1.1 0 01-1.1-1.1V9.67a1.1 1.1 0 012.2 0v4.87a1.1 1.1 0 01-1.1 1.1zm11.64 0a1.1 1.1 0 01-1.1-1.1V9.67a1.1 1.1 0 012.2 0v4.87a1.1 1.1 0 01-1.1 1.1zM8.19 17.6a1.1 1.1 0 01-1.1-1.1v-6.8h9.82v6.8a1.1 1.1 0 01-1.1 1.1H8.19zm3.8-13.2a5.5 5.5 0 00-5.5 5.5h11a5.5 5.5 0 00-5.5-5.5zm-2.2 3.3a.55.55 0 110-1.1.55.55 0 010 1.1zm4.4 0a.55.55 0 110-1.1.55.55 0 010 1.1zM8.9 2l1.3 2.2M15.1 2l-1.3 2.2" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: <IcoLock />,    num: '100%', label: 'Private — data stays on device', color: '#14B8A6' },
  { icon: <IcoPhone />,   num: 'iOS & Android', label: 'Coming soon',           color: '#fff'    },
  { icon: <IcoZap />,     num: '<60s',  label: 'To log your day',               color: '#F59E0B' },
  { icon: <IcoSparkle />, num: '6',     label: 'Core features',                 color: '#fff'    },
]

const FEATURES = [
  {
    icon: <IcoFlame />, iconClass: 'ti',
    title: 'Streak tracking',
    desc: 'Your current streak is always front and centre. We track your personal best too, so every new record is a moment to celebrate — not just survive.',
    accent: 'accentTeal',
  },
  {
    icon: <IcoBulb />, iconClass: 'ai',
    title: 'Personalised insights',
    desc: 'Beacon connects the dots between your mood, triggers, and time of day — revealing patterns you might not notice yourself. Knowledge is the first step to change.',
    accent: '',
  },
  {
    icon: <IcoCoin />, iconClass: 'mi',
    title: 'Savings tracker',
    desc: 'Enter your typical weekly spend and watch the number grow. Seeing real money stack up in real time is one of the most motivating things about sobriety.',
    accent: 'accentAmber',
  },
  {
    icon: <IcoTrophy />, iconClass: 'si',
    title: 'Health milestones',
    desc: 'Unlock science-backed health achievements as your body recovers — better sleep at 7 days, clearer skin at 14, liver recovery at 30. Your biology is cheering you on.',
    accent: '',
  },
]

const STEPS = [
  {
    title: 'Set your intention',
    desc: 'Choose to cut back or go fully sober. Beacon adapts to your goal, not the other way around.',
  },
  {
    title: 'Log each day',
    desc: 'Record your mood, any drinks, and what triggered cravings. Takes under a minute.',
    active: true,
  },
  {
    title: 'Watch it build',
    desc: 'Streaks, health milestones, and savings stack up. Every day gets you further than the last.',
  },
]

const TESTIMONIALS = [
  {
    quote: "Finally an app that doesn't feel clinical. Seeing my streak number every morning changed how I start my day — it's become something I genuinely look forward to protecting.",
    name: 'Sarah M.',
    meta: 'Beta tester · 47 days in',
    initials: 'S',
    avatarColor: 'linear-gradient(135deg, #0F766E, #14B8A6)',
  },
  {
    quote: "The savings tracker was the unexpected motivator. Watching the number climb made sobriety feel tangible in a way I didn't expect. I'm at $340 saved now.",
    name: 'James K.',
    meta: 'Beta tester · cutting back',
    initials: 'J',
    avatarColor: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
  },
  {
    quote: "I love that Beacon works whether you're cutting back or going fully sober. No judgement, no pressure — just honest tracking and real celebration of progress.",
    name: 'Emma L.',
    meta: 'Beta tester · 3 months',
    initials: 'E',
    avatarColor: 'linear-gradient(135deg, #B45309, #F59E0B)',
  },
]

// ── Phone sub-components ──────────────────────────────────────────────────────

function PhoneStatusBar() {
  return (
    <div className={styles.pStatusBar}>
      <span className={styles.pStatusTime}>9:41</span>
      <div className={styles.pSignal}>
        {[5, 7, 9, 11].map(h => (
          <div key={h} className={styles.pSignalBar} style={{ height: h }} />
        ))}
      </div>
    </div>
  )
}

function PhoneBottomNav({ active }) {
  const items = [
    { label: 'Log', icon: '📋' },
    { label: 'Dashboard', icon: '📊' },
    { label: 'Milestones', icon: '🏆' },
    { label: 'Settings', icon: '⚙️' },
  ]
  return (
    <div className={styles.pBottomNav}>
      {items.map(item => (
        <div key={item.label} className={`${styles.pNavItem} ${item.label === active ? styles.pNavActive : ''}`}>
          <span className={styles.pNavIcon}>{item.icon}</span>
          <span className={styles.pNavLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function DashboardScreen() {
  const bars = [
    { day: 'Mon', h: 16, color: '#14B8A6', lbl: '✓', act: false },
    { day: 'Tue', h: 48, color: '#F59E0B', lbl: '3', act: false },
    { day: 'Wed', h: 16, color: '#14B8A6', lbl: '✓', act: false },
    { day: 'Thu', h: 16, color: '#14B8A6', lbl: '✓', act: false },
    { day: 'Fri', h: 30, color: '#F59E0B', lbl: '1', act: false },
    { day: 'Sat', h: 16, color: '#14B8A6', lbl: '✓', act: false },
    { day: 'Sun', h: 56, color: 'rgba(255,255,255,0.07)', lbl: '·', act: true },
  ]
  return (
    <div className={styles.pScreen}>
      <div className={styles.pIsland} />
      <PhoneStatusBar />
      <div className={styles.pScrollArea}>
        <div className={styles.pStreakCard}>
          <div className={styles.pStreakLbl}>Current streak</div>
          <div className={styles.pStreakRow}>
            <span className={styles.pStreakNum}>21</span>
            <span className={styles.pStreakUnit}>days sober</span>
          </div>
          <div className={styles.pStreakPb}><span>🏆</span><span className={styles.pStreakPbTxt}>Personal best!</span></div>
          <div className={styles.pStreakBadge}><IcoStarSm size={10} /><span>You&apos;re on a roll</span></div>
        </div>
        <div className={styles.pGlass}>
          <div className={styles.pCravRow}>
            <div className={styles.pCravIco}>🛡️</div>
            <div className={styles.pCravCol}>
              <div className={styles.pCravTitle}>I resisted a craving</div>
              <div className={styles.pCravMeta}>5 logged this week</div>
            </div>
            <span className={styles.pCravArr}>›</span>
          </div>
        </div>
        <div className={styles.pSavingsCard}>
          <div className={styles.pSavingsIco}>🐷</div>
          <div>
            <div className={styles.pSavingsAmt}>$168.00</div>
            <div className={styles.pSavingsSub}>saved across 21 sober days</div>
          </div>
        </div>
        <div className={`${styles.pGlass} ${styles.pChartCard}`}>
          <div className={styles.pChartHdr}>
            <span className={styles.pChartTitle}>This week</span>
            <span className={styles.pChartUnit}>drinks / day</span>
          </div>
          <div className={styles.pChartBars}>
            {bars.map(b => (
              <div key={b.day} className={styles.pChartCol}>
                <span style={{ fontSize: 7, color: b.color, fontWeight: 700, height: 10, lineHeight: '10px', display: 'block', textAlign: 'center' }}>{b.lbl}</span>
                <div style={{ width: '100%', height: b.h, background: b.color, borderRadius: 3 }} />
                <span style={{ fontSize: 7, color: b.act ? '#14B8A6' : 'rgba(255,255,255,0.45)', fontWeight: b.act ? 700 : 500 }}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.pGlass}>
          <div style={{ padding: '4px 13px 2px', fontSize: 10, fontWeight: 600, color: '#fff' }}>Mood this week</div>
          <div className={styles.pMoodRow}>
            {[['😊','Mon'],['😊','Tue'],['😤','Wed'],['😐','Thu'],['😊','Fri'],['😊','Sat']].map(([e,d]) => (
              <div key={d} className={styles.pMoodDay}>
                <span className={styles.pMoodEmoji}>{e}</span>
                <span className={styles.pMoodLbl}>{d}</span>
              </div>
            ))}
            <div className={styles.pMoodDay}>
              <span style={{ fontSize: 15, opacity: 0.25, lineHeight: 1 }}>○</span>
              <span className={`${styles.pMoodLbl} ${styles.pMoodLblAct}`}>Sun</span>
            </div>
          </div>
        </div>
      </div>
      <PhoneBottomNav active="Dashboard" />
    </div>
  )
}

function LogScreen() {
  return (
    <div className={styles.pScreen}>
      <div className={styles.pIsland} />
      <PhoneStatusBar />
      <div className={styles.pAppBar}>
        <div className={styles.pAppTitle}>How did today go?</div>
        <div className={styles.pAppDate}>Tuesday, 15 July</div>
      </div>
      <div className={styles.pScrollArea}>
        <div className={styles.pGlass}>
          <div className={styles.pCardSecLbl}>Mood</div>
          <div className={styles.pChips}>
            <div className={`${styles.pChip} ${styles.pChipTeal}`}><span>😊</span> Great</div>
            <div className={styles.pChip}><span>😐</span> Okay</div>
            <div className={styles.pChip}><span>😤</span> Stressed</div>
          </div>
          <div className={styles.pChips} style={{ marginTop: 4, paddingTop: 0 }}>
            <div className={styles.pChip}><span>😔</span> Low</div>
            <div className={styles.pChip}><span>😰</span> Anxious</div>
          </div>
        </div>
        <div className={styles.pGlass}>
          <div className={styles.pCardSecLbl}>Triggers</div>
          <div className={styles.pChips}>
            <div className={`${styles.pChip} ${styles.pChipGold}`}><span>😰</span> Stress</div>
            <div className={styles.pChip}><span>👥</span> Social</div>
            <div className={styles.pChip}><span>😑</span> Boredom</div>
          </div>
        </div>
        <div className={styles.pGlass}>
          <div className={styles.pDrinkRow}>
            <span className={styles.pDrinkLbl}>Drinks today</span>
            <div className={styles.pDrinkControls}>
              <div className={styles.pDrinkBtn}>−</div>
              <span className={styles.pDrinkNum}>0</span>
              <div className={styles.pDrinkBtn}>+</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.pSaveBtn}>Save today&apos;s log</div>
      <PhoneBottomNav active="Log" />
    </div>
  )
}

function MilestonesScreen() {
  const milestones = [
    { icon: '🏆', title: '3 days',  sub: 'First long weekend', badge: 'Earned',  type: 'earned'  },
    { icon: '🏆', title: '7 days',  sub: 'One full week',      badge: 'Earned',  type: 'earned'  },
    { icon: '🏆', title: '14 days', sub: 'Two weeks strong',   badge: 'Earned',  type: 'current' },
    { icon: '🔒', title: '30 days', sub: 'One month',          badge: '16 away', type: 'locked'  },
  ]
  return (
    <div className={styles.pScreen}>
      <div className={styles.pIsland} />
      <PhoneStatusBar />
      <div className={styles.pAppBar}>
        <div className={styles.pAppTitle}>Milestones</div>
      </div>
      <div className={styles.pMsStats}>
        {[['14','Streak','#14B8A6'],['14','Best ever','#F59E0B'],['18','Total days','#fff']].map(([n,l,c]) => (
          <div key={l} className={styles.pMsStat}>
            <div style={{ fontSize: 18, fontWeight: 700, color: c, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div className={styles.pScrollArea}>
        <div className={styles.pMsSecLbl}>Streak Records</div>
        {milestones.map(m => (
          <div key={m.title} className={`${styles.pGlass} ${m.type === 'current' ? styles.pMsCurrent : ''}`}>
            <div className={styles.pMsRow}>
              <div className={`${styles.pMsIco} ${m.type === 'locked' ? styles.pMsIcoLocked : styles.pMsIcoEarned}`}>{m.icon}</div>
              <div className={styles.pMsCol}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.type === 'locked' ? 'rgba(255,255,255,0.4)' : '#fff' }}>{m.title}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', marginTop: 1 }}>{m.sub}</div>
              </div>
              <div className={`${styles.pMsBadge} ${m.type === 'locked' ? styles.pMsBadgeLocked : styles.pMsBadgeEarned}`}>{m.badge}</div>
            </div>
          </div>
        ))}
        <div className={styles.pMsSecLbl} style={{ marginTop: 6 }}>Health</div>
        {[['💤','Better sleep','7 days — unlocked'],['💧','Clearer skin','14 days — unlocked']].map(([ico,title,sub]) => (
          <div key={title} className={styles.pGlass}>
            <div className={styles.pMsRow}>
              <div className={`${styles.pMsIco} ${styles.pMsIcoHealth}`}>{ico}</div>
              <div className={styles.pMsCol}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{title}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', marginTop: 1 }}>{sub}</div>
              </div>
              <div className={`${styles.pMsBadge} ${styles.pMsBadgeHealth}`}>✓</div>
            </div>
          </div>
        ))}
      </div>
      <PhoneBottomNav active="Milestones" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Beacon() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [days, setDays]           = useState(0)
  const counterRef                = useRef(null)

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.delay || '0', 10)
          setTimeout(() => e.target.classList.add('is-visible'), delay * 130)
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = counterRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const target = 21, duration = 1600, start = performance.now()
        const tick = now => {
          const p = Math.min((now - start) / duration, 1)
          setDays(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    setSubmitError(false)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setSubmitError(true)
      }
    } catch (err) {
      console.error(err)
      setSubmitError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${poppins.variable} ${inter.variable} ${styles.root}`}>
      <Head>
        <title>Beacon — Sobriety App & Alcohol Tracker | Stop Drinking, Cut Back, Stay Sober</title>
        <meta name="description" content="Beacon is a free sobriety companion app for people who want to stop drinking, cut back on alcohol, or simply understand their habits. Track your streak, log triggers, celebrate milestones — fully private, all on your device." />
        <meta name="keywords" content="sobriety app, alcohol tracker, stop drinking app, quit alcohol, sober streak, cut back on drinking, alcohol habit tracker, sobriety counter, drink less app, alcohol free, sober living, alcohol addiction help" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/beacon-logo.png" type="image/png" />
        <link rel="canonical" href="https://jon-williams.dev/beacon" />

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://jon-williams.dev/beacon" />
        <meta property="og:title"       content="Beacon — Sobriety App & Alcohol Tracker" />
        <meta property="og:description" content="Track your sobriety streak, understand your drinking triggers, and watch your health recover — one day at a time. Private, judgment-free, and built for real life." />
        <meta property="og:image"       content="https://jon-williams.dev/images/beacon-og.png" />

        {/* Twitter / X */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Beacon — Sobriety App & Alcohol Tracker" />
        <meta name="twitter:description" content="Track your sobriety streak, understand your drinking triggers, and watch your health recover — one day at a time." />
        <meta name="twitter:image"       content="https://jon-williams.dev/images/beacon-og.png" />

        {/* JSON-LD structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Beacon",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "iOS, Android",
          "description": "Beacon is a sobriety companion app that helps people stop drinking, cut back on alcohol, or understand their habits. Features include streak tracking, trigger logging, health milestones, and a savings tracker.",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "url": "https://jon-williams.dev/beacon",
          "keywords": "sobriety app, alcohol tracker, stop drinking, quit alcohol, sober streak, cut back on drinking",
          "author": { "@type": "Person", "name": "Jon Williams" }
        })}} />
      </Head>

      {/* Ambient glow */}
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <Image src="/images/beacon-logo.png" alt="" width={44} height={44} className={styles.logoImg} aria-hidden="true" />
            <span className={styles.logoText}>Beacon</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features"      className={styles.navLink}>Features</a>
            <a href="#screens"       className={styles.navLink}>App</a>
            <a href="#how"           className={styles.navLink}>How it works</a>
            <a href="/beacon-story"  className={styles.navLink}>My Story</a>
          </div>
          <a href="#waitlist" className={styles.btnNav}>Get early access →</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
<div className={styles.heroInner}>

          <div className={styles.heroText} data-reveal>
            <div className={styles.eyebrowTag}>
              <div className={styles.eyebrowDot} />
              <span className={styles.eyebrowText}>iOS &amp; Android · Coming Soon</span>
            </div>
            <h1 className={styles.heroH1}>
              Every sober day<br />
              is worth<br />
              <span className={styles.heroGrad}>celebrating.</span>
            </h1>
            <p className={styles.heroSub}>
              Beacon helps you track your streak, understand your triggers, and watch your health recover — one day at a time. No judgement. Just progress.
            </p>
            <div className={styles.heroBtns}>
              <a href="#waitlist" className={styles.btnPrimary}>
                <IcoApple /> Download for iOS
              </a>
              <a href="#waitlist" className={styles.btnGhost}>
                <IcoAndroid /> Get it on Android
              </a>
            </div>
          </div>

          <div className={styles.heroPhoneWrap}>
            <div className={styles.heroPhoneGlow} aria-hidden="true" />
            <div className={styles.heroPhoneShell}>
              <DashboardScreen />
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats band ── */}
      <div className={styles.statsBand}>
        <div className={styles.statsBandInner}>
          {STATS.map(s => (
            <div key={s.label} className={styles.bandStat}>
              <span className={styles.bandStatIcon}>{s.icon}</span>
              <div>
                <div className={styles.bandStatNum} style={{ color: s.color }}>{s.num}</div>
                <div className={styles.bandStatLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features">
        <div className={styles.secWrap}>
          <div className={styles.secHeader} data-reveal>
            <div className={styles.secEyeTeal}>Everything you need</div>
            <h2 className={styles.secH2}>Built around your journey,<br />not our metrics</h2>
            <p className={styles.secSub}>No embarrassing check-ins. No mandatory sharing. Just honest tools to understand your relationship with alcohol.</p>
          </div>
          <div className={styles.featGrid}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`${styles.featCard} ${f.accent ? styles[f.accent] : ''}`} data-reveal data-delay={i % 2 + 1}>
                <div className={`${styles.featIcon} ${styles[f.iconClass]}`}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App screens ── */}
      <section className={styles.screensSection} id="screens">
        <div className={styles.secWrap}>
          <div className={styles.secHeader} data-reveal>
            <div className={styles.secEye}>App screens</div>
            <h2 className={styles.secH2}>Everything in one<br />beautiful place</h2>
            <p className={styles.secSub}>Log your day, track your progress, and celebrate every record. All in under 60 seconds.</p>
          </div>
          <div className={styles.phonesRow} data-reveal data-delay="1">
            <div className={`${styles.phoneShellBase} ${styles.phoneSm} ${styles.phoneSideL}`}>
              <LogScreen />
            </div>
            <div className={`${styles.phoneShellBase} ${styles.phoneLg}`}>
              <DashboardScreen />
            </div>
            <div className={`${styles.phoneShellBase} ${styles.phoneSm} ${styles.phoneSideR}`}>
              <MilestonesScreen />
            </div>
          </div>
        </div>
      </section>

      {/* ── Counter moment ── */}
      <section className={styles.counterBand}>
        <div className={styles.counterBandInner}>
          <div className={styles.counterDisplay} ref={counterRef}>
            <div className={styles.counterNum}>{days}</div>
            <div className={styles.counterMeta}>
              <span className={styles.counterLabel}>days sober</span>
              <span className={styles.counterStar}><IcoStarSm size={14} /> Personal best!</span>
            </div>
          </div>
          <div className={styles.counterStatement} data-reveal>
            <p className={styles.statementText}>
              Whether you&apos;re aiming to cut back —<br />
              <em className={styles.statementAccent}>or stay completely sober.</em>
            </p>
            <p className={styles.statementSub}>Beacon is there to guide the way.</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how">
        <div className={styles.secWrap}>
          <div className={styles.secHeader} data-reveal>
            <div className={styles.secEyeTeal}>How it works</div>
            <h2 className={styles.secH2}>Simple by design</h2>
            <p className={styles.secSub}>Three steps. Under a minute a day. A lifetime of progress.</p>
          </div>
          <div className={styles.howGrid}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={styles.howStep} data-reveal data-delay={i + 1}>
                <div className={`${styles.howNum} ${step.active ? styles.howNumActive : ''}`}>{i + 1}</div>
                <h3 className={styles.howTitle}>{step.title}</h3>
                <p className={styles.howDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (hidden until real data — re-enable by removing the null &&) ── */}
      {null && (
      <section id="stories">
        <div className={styles.secWrap}>
          <div className={styles.secHeader} data-reveal>
            <div className={styles.secEye}>Beta feedback</div>
            <h2 className={styles.secH2}>From people on<br />the journey</h2>
          </div>
          <div className={styles.testGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={styles.testCard} data-reveal data-delay={i + 1}>
                <div className={styles.testStars}>★★★★★</div>
                <p className={styles.testQuote}>{t.quote}</p>
                <div className={styles.testAuthor}>
                  <div className={styles.testAvatar} style={{ background: t.avatarColor }}>{t.initials}</div>
                  <div>
                    <div className={styles.testName}>{t.name}</div>
                    <div className={styles.testMeta}>{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── CTA / Waitlist ── */}
      <section id="waitlist">
        <div className={styles.secWrapSm}>
          <div className={styles.ctaBox} data-reveal>
            <div className={styles.ctaBoxGlow} aria-hidden="true" />
            <div className={styles.secEyeTeal} style={{ marginBottom: 18 }}>Launch notification</div>
            <h2 className={styles.ctaH2}>Be the first to know<br />when Beacon launches</h2>
            <p className={styles.ctaSub}>Leave your email and we&apos;ll reach out the moment it&apos;s ready. No spam, just the launch notification.</p>
            {submitted ? (
              <div className={styles.successState}>
                <svg viewBox="0 0 24 24" fill="none" className={styles.successIcon} strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>You&apos;re on the list. We&apos;ll be in touch.</p>
              </div>
            ) : (
              <form className={styles.ctaForm} onSubmit={handleSubmit}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className={styles.emailInput} aria-label="Email address"
                />
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Sending…' : 'Join the waitlist'}
                </button>
              </form>
            )}
            {submitError && (
              <p className={styles.submitErrorMsg}>Something went wrong — please try again or email us directly.</p>
            )}
            <p className={styles.ctaNote}>No spam · No account required · iOS &amp; Android</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/images/beacon-logo.png" alt="" width={40} height={40} className={styles.footerLogoImg} aria-hidden="true" />
            <span className={styles.footerWordmark}>Beacon</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="#features" className={styles.footerLink}>Features</a>
            <a href="#screens"  className={styles.footerLink}>App</a>
            <a href="#waitlist" className={styles.footerLink}>Join waitlist</a>
          </div>
          <p className={styles.footerNote}>© {new Date().getFullYear()} Beacon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

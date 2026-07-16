import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Poppins, Inter } from 'next/font/google'
import { useState } from 'react'
import styles from '../../styles/beacon-story.module.scss'

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

const SECTIONS = [
  {
    title: 'Who we are',
    body: `Beacon is a sobriety companion app built and operated by Jon Williams, an independent developer based in the United Kingdom. If you have any questions about this policy, you can contact us at beacon@jon-williams.dev.`,
  },
  {
    title: 'What data Beacon collects',
    body: `When you create an account, Beacon collects your email address and a password (stored securely and never visible to us). Inside the app, Beacon stores the information you choose to enter: your sobriety goal, daily logs, mood entries, trigger notes, and streak history. Nothing is collected automatically beyond what you actively record.`,
  },
  {
    title: 'How your data is stored',
    body: `Beacon uses Google Firebase to store your data securely in the cloud. Firebase is a Google service that encrypts data in transit and at rest. Your data is stored in Google's European data centres and is accessible only to your account. We do not have access to your individual records unless you explicitly share them with us for support purposes.`,
  },
  {
    title: 'Why we collect your data',
    body: `Your data is used solely to power the Beacon app — to save your progress, sync across your devices, and show you your history and insights. We do not use your data for advertising. We do not sell your data. We do not share your data with any third party except Google Firebase, which processes it on our behalf under their own privacy and security standards.`,
  },
  {
    title: 'How long we keep your data',
    body: `Your data is kept for as long as your account is active. If you delete your account, all of your personal data — including your logs, streak history, and account details — is permanently deleted within 30 days. You can request deletion at any time by contacting us at beacon@jon-williams.dev.`,
  },
  {
    title: 'Your rights under GDPR',
    body: `If you are based in the UK or European Union, you have the following rights regarding your personal data:\n\n• The right to access the data we hold about you\n• The right to correct inaccurate data\n• The right to request deletion of your data\n• The right to restrict or object to how we process your data\n• The right to data portability (receive your data in a usable format)\n\nTo exercise any of these rights, contact us at beacon@jon-williams.dev. We will respond within 30 days.`,
  },
  {
    title: 'Cookies and tracking',
    body: `Beacon does not use advertising cookies or third-party tracking. The Beacon website uses only essential cookies required for the site to function. No analytics or behavioural tracking is in place.`,
  },
  {
    title: 'Children',
    body: `Beacon is not intended for use by anyone under the age of 18. We do not knowingly collect data from children. If you believe a child has created an account, please contact us and we will delete it promptly.`,
  },
  {
    title: 'Changes to this policy',
    body: `If we make significant changes to how we handle your data, we will notify you via the app or by email before those changes take effect. The date at the bottom of this page reflects when this policy was last updated.`,
  },
]

export default function BeaconPrivacy() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`${poppins.variable} ${inter.variable} ${styles.root}`}>
      <Head>
        <title>Privacy Policy | Beacon</title>
        <meta name="description" content="Beacon's privacy policy — what data we collect, how it is stored using Firebase, and your rights under GDPR." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/beacon-logo.png" type="image/png" />
        <link rel="canonical" href="https://jon-williams.dev/beacon/privacy" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.bgGlow} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/beacon" className={styles.logo}>
            <Image src="/images/beacon-logo.png" alt="" width={44} height={44} unoptimized className={styles.logoImg} aria-hidden="true" />
            <span className={styles.logoText}>Beacon</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/beacon#features" className={styles.navLink}>Features</Link>
            <Link href="/beacon#screens"  className={styles.navLink}>App</Link>
            <Link href="/beacon#how"      className={styles.navLink}>How it works</Link>
            <Link href="/beacon/story"    className={styles.navLink}>My Story</Link>
          </div>
          <Link href="/beacon#waitlist" className={styles.btnNav}>Get early access →</Link>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerBarTop : ''}`} />
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerBarMid : ''}`} />
            <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerBarBot : ''}`} />
          </button>
        </div>
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/beacon#features" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="/beacon#screens"  className={styles.mobileLink} onClick={() => setMenuOpen(false)}>App</Link>
            <Link href="/beacon#how"      className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How it works</Link>
            <Link href="/beacon/story"    className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Story</Link>
            <Link href="/beacon#waitlist" className={styles.mobileCta}  onClick={() => setMenuOpen(false)}>Get early access →</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrowTag}>
            <div className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>Beacon · Privacy</span>
          </div>
          <h1 className={styles.heroH1}>Privacy Policy</h1>
          <p className={styles.heroSub}>
            Plain English. No legal jargon. This is exactly what we collect, why we collect it, and what your rights are.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className={styles.storySection}>
        <div className={styles.storyWrap}>
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className={styles.storyLead}>{s.title}</h2>
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} className={styles.storyP} style={{ whiteSpace: 'pre-line' }}>{para}</p>
              ))}
              <div className={styles.storyDivider} style={{ marginTop: 8 }} />
            </div>
          ))}
          <p className={styles.storyP} style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
            Last updated: July 2026
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/images/beacon-logo.png" alt="" width={40} height={40} unoptimized className={styles.footerLogoImg} aria-hidden="true" />
            <span className={styles.footerWordmark}>Beacon</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/beacon#features"  className={styles.footerLink}>Features</Link>
            <Link href="/beacon#waitlist"  className={styles.footerLink}>Join waitlist</Link>
            <Link href="/beacon/story"     className={styles.footerLink}>My Story</Link>
            <Link href="/beacon/privacy"   className={styles.footerLink}>Privacy</Link>
          </div>
          <p className={styles.footerNote}>© {new Date().getFullYear()} Beacon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

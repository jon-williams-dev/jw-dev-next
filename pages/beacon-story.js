import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Poppins, Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import styles from '../styles/beacon-story.module.scss'

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

const PRINCIPLES = [
  {
    num: '01',
    title: 'Awareness before judgment',
    desc: 'Beacon should help people understand their behaviour without making them feel ashamed. Clarity comes first.',
  },
  {
    num: '02',
    title: 'Progress over perfection',
    desc: 'A difficult day or setback should not erase the progress someone has already made. Every step forward counts.',
  },
  {
    num: '03',
    title: 'Built for real life',
    desc: 'Beacon should support people who want to stop drinking completely, reduce their intake, or simply understand their habits better.',
  },
]

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export default function BeaconStory() {
  const [menuOpen, setMenuOpen] = useState(false)

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

  return (
    <div className={`${poppins.variable} ${inter.variable} ${styles.root}`}>
      <Head>
        <title>Why I Built Beacon | My Story — Alcohol Habit & Sobriety App</title>
        <meta name="description" content="The personal story behind Beacon: how one developer's struggle with drinking habits led to building a private, judgment-free sobriety app for people who want to stop drinking or cut back." />
        <meta name="keywords" content="why I stopped drinking, alcohol habit story, cut back on alcohol, sobriety journey, drinking problem, alcohol coping mechanism, sober app story, quit drinking motivation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/beacon-logo.png" type="image/png" />
        <link rel="canonical" href="https://jon-williams.dev/beacon-story" />

        {/* Open Graph */}
        <meta property="og:type"        content="article" />
        <meta property="og:url"         content="https://jon-williams.dev/beacon-story" />
        <meta property="og:title"       content="Why I Built Beacon — My Story" />
        <meta property="og:description" content="I built Beacon because I needed it too. A personal story about drinking habits, the decision to change, and why I built a sobriety app." />
        <meta property="og:image"       content="https://jon-williams.dev/images/beacon-og.png" />

        {/* Twitter / X */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Why I Built Beacon — My Story" />
        <meta name="twitter:description" content="I built Beacon because I needed it too. A personal story about drinking habits and why I built a sobriety app." />
        <meta name="twitter:image"       content="https://jon-williams.dev/images/beacon-og.png" />
      </Head>

      <div className={styles.bgGlow} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/beacon" className={styles.logo}>
            <Image src="/images/beacon-logo.png" alt="" width={44} height={44} className={styles.logoImg} aria-hidden="true" />
            <span className={styles.logoText}>Beacon</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/beacon#features" className={styles.navLink}>Features</Link>
            <Link href="/beacon#screens"  className={styles.navLink}>App</Link>
            <Link href="/beacon#how"      className={styles.navLink}>How it works</Link>
            <span className={styles.navLinkActive}>My Story</span>
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
            <span className={styles.mobileLink}>My Story</span>
            <Link href="/beacon#waitlist" className={styles.mobileCta}  onClick={() => setMenuOpen(false)}>Get early access →</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner} data-reveal>
          <div className={styles.eyebrowTag}>
            <div className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>Why Beacon Exists</span>
          </div>
          <h1 className={styles.heroH1}>
            I built Beacon because<br />I needed it too.
          </h1>
          <p className={styles.heroSub}>
            Beacon began as a personal project: a way to understand my drinking habits,
            regain control, and create a healthier future for myself and my family.
          </p>
          <a href="#story" className={styles.scrollHint} aria-label="Continue reading">
            <span className={styles.scrollHintText}>Read my story</span>
            <ChevronDown />
          </a>
        </div>
      </section>

      {/* ── Story ── */}
      <section className={styles.storySection} id="story">
        <div className={styles.storyWrap}>

          <p className={styles.storyLabel} data-reveal>My Story</p>

          <p className={`${styles.storyLead}`} data-reveal>
            I never thought of myself as someone with a drinking problem.
          </p>

          <div data-reveal>
            <p className={styles.storyP}>
              For most of my adult life, I was simply a social drinker. Alcohol was part of celebrations, weekends, holidays, meals with friends and almost every social occasion. It felt normal because that was how it had always been.
            </p>
            <p className={styles.storyP}>
              Over time, though, something changed.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              Drinking slowly stopped being just a social activity and became part of my everyday routine. I would have a beer while cooking, another while eating and another while watching TV — not because there was a special occasion, but simply for the sake of it.
            </p>
            <p className={styles.storyP}>
              Sometimes, I did not even intend to have a beer. I would find myself walking to the fridge almost on autopilot. Before I had really thought about it, I was standing there with a drink in my hand.
            </p>
            <p className={styles.storyP}>
              It had become such a deeply ingrained habit that I was not always making a conscious decision anymore. The amount I drank gradually increased, almost without me noticing.
            </p>
          </div>

          <blockquote className={styles.pullQuote} data-reveal>
            <p className={styles.pullText}>For me, the biggest problem was not having the first beer.</p>
            <p className={styles.pullSub}>It was stopping at one.</p>
          </blockquote>

          <div data-reveal>
            <p className={styles.storyP}>
              Once I had opened the first one, I rarely wanted to stop. I could force myself to, but I did not want to. Stress and habit had become much bigger drivers than enjoyment.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              Alcohol also became a coping mechanism. Life is busy. Between work, family, responsibilities and the constant list of things that need doing, I often felt under pressure. After a few beers, I felt relaxed. My mind slowed down and I stopped worrying so much.
            </p>
            <p className={styles.storyP}>
              At the time, it felt like alcohol was helping me cope. Gradually, I realised I was relying on it more and more to switch off.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              I also began to notice what alcohol was taking away from me. I exercised less, skipped sports and lost motivation. After a few beers, I stopped caring about what I ate. Healthy intentions disappeared and I would eat whatever junk food happened to be nearby.
            </p>
            <p className={styles.storyP}>
              None of these things seemed significant on their own, but together they were slowly pushing me in a direction I did not want to go.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              I have a young family, and I do not want alcohol to become something that defines my future — or theirs.
            </p>
            <p className={styles.storyP}>
              My parents were both heavy drinkers, and my mother eventually died from alcohol-related illness. That made me realise I could not keep assuming things would somehow be different for me if I continued down the same path.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              I knew I wanted to change. Not necessarily because I never want to enjoy another beer, but because I want to be in control of the decision.
            </p>
            <p className={`${styles.storyP} ${styles.storyEmphasis}`} data-reveal>
              My goal is freedom.
            </p>
            <p className={styles.storyP}>
              I want to be able to enjoy one or two beers with friends and then stop because that is enough — not because I have had to force myself to stop.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              When I started thinking seriously about changing my habits, I looked at some of the apps that already existed. There are good tools available, but I realised I wanted to create something I could control and shape around the way I think, the things that motivate me and the features I personally needed.
            </p>
            <p className={styles.storyP}>
              So I decided to build Beacon.
            </p>
            <p className={styles.storyP}>
              Beacon started as something for me: a tool to help me understand my habits, stay accountable and remember why I wanted to change. But I also hope it can help others.
            </p>
          </div>

          <div className={styles.storyDivider} data-reveal />

          <div data-reveal>
            <p className={styles.storyP}>
              I do not know whether my story will resonate with everyone.
            </p>
            <p className={styles.storyP}>
              But perhaps you have also found yourself standing in front of the fridge with a drink in your hand before you had consciously decided to have one. Perhaps drinking has quietly become part of your everyday routine. Perhaps you are not sure whether you have a serious problem, but you know something does not feel right.
            </p>
            <p className={styles.storyP}>
              Or perhaps you simply want to feel in control again rather than following the same habits every day.
            </p>
            <p className={`${styles.storyP} ${styles.storyEmphasis}`}>
              That is who I built Beacon for.
            </p>
          </div>

          <div className={styles.closingStanza} data-reveal>
            <span className={styles.stanzaLine}>Because lasting change does not always happen through one big decision.</span>
            <span className={styles.stanzaLine}>It happens one choice at a time.</span>
            <span className={styles.stanzaLine}>One day at a time.</span>
            <span className={`${styles.stanzaLine} ${styles.stanzaLineFinal}`}>One light guiding the way.</span>
          </div>

        </div>
      </section>

      {/* ── Callout ── */}
      <section className={styles.calloutSection}>
        <div className={styles.calloutWrap} data-reveal>
          <div className={styles.calloutBox}>
            <div className={styles.calloutGlow} aria-hidden="true" />
            <p className={styles.calloutText}>
              My goal is not perfection. It is freedom — the freedom to make a conscious choice rather than simply following a habit.
            </p>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className={styles.principlesSection}>
        <div className={styles.principlesWrap}>
          <div className={styles.secHeader} data-reveal>
            <div className={styles.secEyeTeal}>Why Beacon</div>
            <h2 className={styles.secH2}>Built on three simple beliefs</h2>
          </div>
          <div className={styles.principlesGrid}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className={styles.principleCard} data-reveal data-delay={i + 1}>
                <div className={styles.principleNum}>{p.num}</div>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaWrap} data-reveal>
          <h2 className={styles.ctaH2}>
            You do not have to have everything figured out to begin.
          </h2>
          <p className={styles.ctaSub}>
            Whether you want to stop drinking, cut back or simply understand your habits, Beacon is designed to help you take the next step.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/beacon#waitlist" className={styles.btnPrimary}>Start your journey</Link>
            <Link href="/beacon#how"      className={styles.btnGhost}>Learn how Beacon works</Link>
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
            <Link href="/beacon#features" className={styles.footerLink}>Features</Link>
            <Link href="/beacon#screens"  className={styles.footerLink}>App</Link>
            <Link href="/beacon#waitlist" className={styles.footerLink}>Join waitlist</Link>
            <Link href="/beacon-story"    className={styles.footerLink}>My Story</Link>
          </div>
          <p className={styles.footerNote}>© {new Date().getFullYear()} Beacon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

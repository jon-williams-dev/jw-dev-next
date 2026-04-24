import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/layout_blank'
import gradientStyles from '../styles/gradientBg.module.scss'

export default function Home() {
  return (
    <Layout blank>
      <div className={gradientStyles.gradientContainer}>
        <section className="hero is-fullheight" style={{position: 'relative'}}>
          <div className="hero-body">
            <div className="container has-text-centered">
              <div className="content is-large">
                <div className="block">
                  <a href="mailto:jon.williams@hey.com">
                    <Image
                      priority
                      src="/images/logo_white.png"
                      height={240}
                      width={600}
                      alt="Jon Williams"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className={gradientStyles.scrollArrow} onClick={() => document.getElementById('content').scrollIntoView({ behavior: 'smooth' })}>
            <svg width="32" height="20" viewBox="0 0 32 20" fill="rgba(255,255,255,0.7)">
              <polygon points="0,0 32,0 16,20" />
            </svg>
          </div>
        </section>
      </div>

      <section id="content" className="section" style={{paddingTop: '1.5rem'}}>
        <div className="container">
          <div className="content">

            <p className="is-size-6 has-text-weight-semibold has-text-grey" style={{letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem'}}>Jon Williams</p>
            <p className="is-size-1 has-text-weight-bold" style={{lineHeight: 1.1, marginBottom: '1.5rem'}}>Full Stack Developer</p>

            <p className="is-size-5" style={{maxWidth: '640px', marginBottom: '3rem'}}>20+ years of experience designing, building and shipping web applications — from early-stage concepts through to production. Strong instinct for both design and engineering, with a focus on building things that are fast, maintainable and actually useful.</p>

            <div className="block mb-6" style={{borderLeft: '3px solid #118AB2', paddingLeft: '1.25rem'}}>
              <p className="is-size-6 has-text-weight-bold has-text-grey-light mb-1" style={{letterSpacing: '0.1em', textTransform: 'uppercase'}}>Current Role</p>
              <p className="is-size-5">Web Lead at the <a href="https://is.mpg.de" target="_blank" rel="noreferrer">Max Planck Institute for Intelligent Systems</a> — leading architecture decisions, driving technical direction and shipping across a portfolio of projects. Comfortable moving between high-level planning and low-level implementation, from system design and API integration to performance optimisation and deployment pipelines.</p>
            </div>

            <div className="block" style={{borderLeft: '3px solid #EF476F', paddingLeft: '1.25rem'}}>
              <p className="is-size-6 has-text-weight-bold has-text-grey-light mb-1" style={{letterSpacing: '0.1em', textTransform: 'uppercase'}}>Work Together</p>
              <p className="is-size-5">Always open to interesting side projects and collaborations. <a href="mailto:jon.williams@hey.com">Get in touch.</a></p>
            </div>

            <p className="mt-5">
              <Link href="/profile" className="has-text-grey-light">More about me →</Link>
            </p>

          </div>
        </div>
      </section>
    </Layout>
  )
}

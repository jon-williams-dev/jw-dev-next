import Image from 'next/image'
import Layout, { siteTitle } from '../components/layout_blank'
// import Link from 'next/link'
// import indexStyles from '../styles/index.module.scss'
import gradientStyles from '../styles/gradientBg.module.scss'

export default function Home() {
  return (
    <Layout blank>
      <div className={gradientStyles.gradientContainer}>
      
          <section className="hero is-fullheight">
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
          </section>

          {/*<footer className={gradientStyles.gradientFooter}>
            <div className="container">
              <div className="columns is-hidden-touch">
                <div className="column">
                  <div className={gradientStyles.gradientFooterP}>
                    <h1 className="is-size-5">Web Development, Tübingen, Germany</h1>
                  </div>
                </div>
                <div className="column">
                  <div className={gradientStyles.gradientFooterP}>
                    <p className="is-size-5 has-text-right">Reach out: <a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></p>
                  </div>
                </div>
              </div>
              <div className="columns is-hidden-desktop">
                <div className="column mx-3">
                  <div className={gradientStyles.gradientFooterP}>
                    <p className="is-size-5">Reach out: <a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></p>
                  </div>
                </div>
              </div>
            </div>
          </footer>*/}
             
    </div>
    </Layout>
  )
}
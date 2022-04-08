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
                    <Image
                      priority
                      src="/images/logo_white.png"
                      height={240}
                      width={600}
                      alt="Jon Williams"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
             
    </div>
    </Layout>
  )
}
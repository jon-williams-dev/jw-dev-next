import Image from 'next/image'
// import Layout, { siteTitle } from '../components/layout'
import Layout, { siteTitle } from '../components/layout_index'
import Link from 'next/link'
import indexStyles from '../styles/index.module.scss'

/*import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/free-solid-svg-icons'
*/
export default function Home() {
  return (
    <Layout home>

      <div className="container">
        <section className="hero is-fullheight">
          <div className="hero-body">
            <div className="container has-text-centered">
      
              <div className="content is-large">
                <div className="block">
                  <Image
                    priority
                    src="/images/logo.png"
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

      {/*<div className="container">
        <section className="hero is-fullheight">
          <div className="hero-body">
            <div className="content is-large">
              <div className="block">

                <h1 className="title">
                  Read{' '}
                  <Link href="/house">
                    <a>house index</a>
                  </Link>
                </h1>

                <Image
                  priority
                  src="/images/logo.png"
                  height={160}
                  width={400}
                  alt="Jon Williams"
                      />
              </div>
              <div className="block">
                <p className="title">Hi, my name is Jon.</p>
                <p>I'm a Full Stack Developer working at the <a href="https://is.mpg.de" target="_blank">Max Planck Institute for Intelligent Systems</a>.</p>
                <p>When I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things.</p>
              </div>
              <div className="block has-text-grey">
                <FontAwesomeIcon icon={faLaptopCode} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faBaby} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faShuttleVan} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faTree} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faRunning} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faMotorcycle} className="fa-lg mr-5" />
                <FontAwesomeIcon icon={faTools} className="fa-lg mr-5" />
              </div>

            </div>
          </div>
        </section>
      </div>*/}
    </Layout>
  )
}
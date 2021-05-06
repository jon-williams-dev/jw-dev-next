// import Head from 'next/head'
import Image from 'next/image'
import Layout, { siteTitle } from '../components/layout'
// import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import indexStyles from '../styles/index.module.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/pro-duotone-svg-icons'
// import { faLaptop } from '@fortawesome/pro-duotone-svg-icons'

export default function Home() {
  return (
    <Layout home>
     {/* <section className="section">

        <figure class="image is-128x128">
          <Image
              priority
              src="/images/profile.jpg"
              class="is-rounded"
              height={144}
              width={144}
              alt="Jon Williams"
                  />
          </figure>
          <h1>Jon Williams</h1>
         <Link href="/profile">
          <a>Profile</a>
         </Link>
      </section>*/}

      <section className="hero is-fullheight">
        <div className="hero-body">
          <div className="content is-large">
            <div className="block">
              <Image
                priority
                src="/images/logo.png"
                height={160}
                width={400}
                alt="Jon Williams"
                    />
            </div>
            <div className="block">
              <p className="title">Hi, my name is Jon. {/*Im from the UK and currently living in Germany.*/}</p>
              <p>I'm a Full Stack Developer working at the <a href="https://is.mpg.de" target="_blank">Max Planck Institute for Intelligent Systems</a>. {/*<FontAwesomeIcon icon={faExternalLink} className="fa-sm" />*/}</p>
              <p>When I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things.</p>
            </div>
            <div className="block has-text-grey">
              {/*<FontAwesomeIcon icon={faLaptopCode} className={indexStyles.profileIcon} />*/}
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
    </Layout>
  )
}



// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
// import Link from 'next/link'


// export default function Home() {
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Jon Williams</title>
//         <meta name="description" content="Jon Williams Full Stack Web Developer" />
//         <meta name="keywords" content="web,developer,web developer,full stack,freelance,freelancer,tuebingen,tübingen,germany,uk,england,ruby,rails,ruby on rails,ror,hotwire,react,next,html,css,javascript" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>
//         {/*<h1 className={styles.title}>
//           Jon Williams
//         </h1>*/}

//         <h1 className="title">
//           Jon Williams{' - '}
//           <Link href="/profile">
//             <a>Profile</a>
//           </Link>
//         </h1>
//       </main>

//       <footer className={styles.footer}>
       
//       </footer>
//     </div>
//   )
// }

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from './layout.module.css'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

const name = 'JW Bikes'
export const siteTitle = 'JW Bikes'

export default function Layout({ children, home }) {
  return (
  	<div>
      	<Head>
      		<link
            	rel="preload"
            	href="/fonts/Jost/Jost-Regular.ttf"
            	as="font"
            	crossOrigin=""
          	/>
        	<link rel="icon" href="/favicon.ico" />
        	<title>{siteTitle}</title>
        	<meta name="description" content="JW Bikes" />
            <meta name="keywords" content="motorbikes, motorcycles, motorrad, superbike, supersport, 90s, oldtimer, youngtimer, ducati, honda, kawasaki, suzuki, yamaha, fireblade, ninja" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        	<meta
          		property="og:image"
          		content={`https://og-image.vercel.app/${encodeURI(
            	siteTitle
          		)}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        	/>
        	<meta name="og:title" content={siteTitle} />
        	<meta name="twitter:card" content="summary_large_image" />
      	</Head>

      	<div className={styles.colorBar}></div>
  		  <main>{children}</main>

    		<footer className="footer">
  				<div className="container">
            <div className={styles.footer}>
             <p className="is-size-5">Reach out: <strong><a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></strong></p>
            </div>
  				</div>
  		  </footer>
    	
    </div>
  )
}
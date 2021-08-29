import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from './layout.module.css'
// import utilStyles from '../styles/utils.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEnvelope } from '@fortawesome/pro-duotone-svg-icons'

const name = 'Jon Williams'
export const siteTitle = 'Jon Williams'

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
        	<meta name="description" content="Jon Williams Full Stack Web Developer" />
            <meta name="keywords" content="web,developer,web developer,full stack,freelance,freelancer,tuebingen,tübingen,germany,uk,england,ruby,rails,ruby on rails,ror,hotwire,react,next,html,css,javascript" />
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
  
      	{/*<header className={styles.header}>
        	{home ? (
          		<>
            		<Image
              			priority
						src="/images/profile.jpg"
						className={utilStyles.borderCircle}
						height={144}
						width={144}
						alt={name}
            		/>
            		<h1 className={utilStyles.heading2Xl}>{name}</h1>
          		</>
        	) : (
          		<>
            		<Link href="/">
              			<a>
                			<Image
								priority
								src="/images/profile.jpg"
								className={utilStyles.borderCircle}
								height={108}
								width={108}
								alt={name}
                			/>
              			</a>
            		</Link>
            		
            		<h2 className={utilStyles.headingLg}>
              			<Link href="/">
                			<a className={utilStyles.colorInherit}>{name}</a>
              			</Link>
            		</h2>
          		</>
        	)}
      	</header>*/}

  		<main>{children}</main>

  		<footer className="footer">
				<div className="container">
          <div className={styles.footer}>
					 <p className="is-size-5">Reach out: <FontAwesomeIcon icon={faEnvelope} className="" /> <strong><a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></strong></p>
          </div>
				</div>
		  </footer>
    	
    </div>
  )
}
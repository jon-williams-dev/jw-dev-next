import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from './layout.module.css'
import transportStyles from '../styles/transport.module.scss'
import Pixel from '../components/pixel'
import ClarityMicrosoft from '../components/clarity_microsoft'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

const name = 'JW Motorcycle Transport'
export const siteTitle = 'JW Motorcycle Transport'

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
                <meta name="description" content="JW Motorcycle Transport" />
                <meta name="keywords" content="motorbikes, motorcycles, motorrad, delivery, transport, lieferung" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    property="og:image"
                    content={`https://og-image.vercel.app/${encodeURI(
                        siteTitle
                    )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />

                <Pixel name='FACEBOOK_PIXEL_1' />
                <ClarityMicrosoft />
            </Head>

            <div className={styles.colorBar}></div>
            <main>{children}</main>
            <footer className="footer">
                <div className="container">
                    <div className={styles.footer}>
                        <div class="columns">
                            <div class="column is-size-5 has-text-right">
                                <strong><a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></strong>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}
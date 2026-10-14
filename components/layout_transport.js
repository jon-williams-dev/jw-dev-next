import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from './layout.module.css'
import transportStyles from '../styles/transport.module.scss'
import Pixel from '../components/pixel'
import ClarityMicrosoft from '../components/clarity_microsoft'
import { CONTENT, LANGS } from './transport_content'

import { TRANSPORT_URL } from '../lib/transport_domains'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

export const siteTitle = 'JW Motorcycle Transport'

export default function Layout({ children, lang = 'en', seo = false }) {
    const { title, description, siteName } = CONTENT[lang].meta
    const url = `${TRANSPORT_URL}${LANGS[lang].publicPath}`
    const image = `${TRANSPORT_URL}/images/logo_transport.png`
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
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={image} />
                <meta property="og:image:width" content="800" />
                <meta property="og:image:height" content="278" />
                <meta property="og:locale" content={LANGS[lang].locale} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={image} />
                {seo && <link rel="canonical" href={url} />}
                {seo && <meta property="og:url" content={url} />}
                {seo && Object.entries(LANGS).filter(([code]) => code !== lang).map(([code, { locale }]) => (
                    <meta key={`og-${code}`} property="og:locale:alternate" content={locale} />
                ))}
                {seo && Object.entries(LANGS).map(([code, { publicPath }]) => (
                    <link key={code} rel="alternate" hrefLang={code} href={`${TRANSPORT_URL}${publicPath}`} />
                ))}
                {seo && <link rel="alternate" hrefLang="x-default" href={`${TRANSPORT_URL}${LANGS.en.publicPath}`} />}

                <Pixel name='FACEBOOK_PIXEL_1' />
                <ClarityMicrosoft />
            </Head>

            <div className={styles.colorBar}></div>
            <main>{children}</main>
            <footer className={transportStyles.transportFooter}>
                <div className="container">
                    <div className="columns">
                        <div className="column is-size-6">
                            © {new Date().getFullYear()} JW Motorcycle Transport
                        </div>
                        <div className="column is-size-6 has-text-right">
                            <a className="has-text-white" href="mailto:jon.williams@hey.com">jon.williams@hey.com</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}
import { useEffect, useState } from 'react'
import Image from 'next/image'
import transportStyles from '../styles/transport.module.scss'
import { CONTENT, LANGS } from './transport_content'
import { TRANSPORT_HOST } from '../lib/transport_domains'

export default function NavTransport({ lang = 'en' }) {
    const [isActive, setIsActive] = useState(false)
    const t = CONTENT[lang].nav
    const close = () => setIsActive(false)

    // Public URLs (/ and /en) only exist on the transport domain; elsewhere (localhost, previews) use page routes.
    const [onTransportDomain, setOnTransportDomain] = useState(true)
    useEffect(() => setOnTransportDomain(window.location.hostname === TRANSPORT_HOST), [])
    const href = (code) => (onTransportDomain ? LANGS[code].publicPath : LANGS[code].path)

    return (
        <nav className={`navbar is-black is-fixed-top ${transportStyles['navbar-transport']}`} role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <a className="navbar-item" href={href(lang)}>
                    <Image
                        priority
                        src="/images/transport_nav_logo.png"
                        alt={`${CONTENT[lang].meta.siteName} logo`}
                        width={407}
                        height={40}
                        className={transportStyles['nav-logo']}
                    />
                </a>

                <a
                    role="button"
                    className={`navbar-burger ${isActive ? 'is-active' : ''}`}
                    aria-label="menu"
                    aria-expanded={isActive ? 'true' : 'false'}
                    data-target="navbarTransport"
                    onClick={() => setIsActive(!isActive)}
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navbarTransport" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                <div className="navbar-start">
                    <a className="navbar-item" href="#services" onClick={close}>{t.services}</a>
                    <a className="navbar-item" href="#how-it-works" onClick={close}>{t.howItWorks}</a>
                    <a className="navbar-item" href="#prices" onClick={close}>{t.prices}</a>
                    <a className="navbar-item" href="#about" onClick={close}>{t.about}</a>
                    <a className="navbar-item" href="#faq" onClick={close}>{t.faq}</a>
                    <a className="navbar-item" href="#quote" onClick={close}>{t.quote}</a>
                </div>

                <div className="navbar-end">
                    <div className="navbar-item">
                        {Object.entries(LANGS).map(([code, { label, name }], i) => (
                            <span key={code}>
                                {i > 0 && <span className="has-text-grey mx-1">|</span>}
                                <a
                                    href={href(code)}
                                    hrefLang={code}
                                    lang={code}
                                    title={name}
                                    aria-current={code === lang ? 'page' : undefined}
                                    className={code === lang ? 'has-text-white has-text-weight-bold' : 'has-text-grey-light'}
                                >
                                    {label}
                                </a>
                            </span>
                        ))}
                    </div>
                    <div className="navbar-item">
                        <div className="buttons">
                            <a className="button is-dark" href="mailto:jon.williams@hey.com">{t.contact}</a>
                            <a className="button is-dark" href="#quote">{t.requestQuote}</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

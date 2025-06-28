import { useState } from 'react'
import Image from 'next/image'
import transportStyles from '../styles/transport.module.scss'

export default function NavTransport({ children, home }) {
    const [isActive, setIsActive] = useState(false)

    return (
        <>
            <nav className={`navbar is-black is-fixed-top ${transportStyles['navbar-transport']}`} role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <a className="navbar-item" href="/transport">
                        <Image
                            priority
                            src="/images/transport_nav_logo.png"
                            alt="JW Motorcycle Transport"
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
                        data-target="navbarBasicExample"
                        onClick={() => setIsActive(!isActive)}
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
                    <div className="navbar-start">
                        <a className="navbar-item" href="#services" onClick={() => setIsActive(false)}>Services</a>
                        <a className="navbar-item" href="#how-it-works" onClick={() => setIsActive(false)}>How It Works</a>
                        <a className="navbar-item" href="#prices" onClick={() => setIsActive(false)}>Prices</a>
                        <a className="navbar-item" href="#about" onClick={() => setIsActive(false)}>About</a>
                        <a className="navbar-item" href="#faq" onClick={() => setIsActive(false)}>FAQ</a>
                        <a className="navbar-item" href="#quote" onClick={() => setIsActive(false)}>Quote</a>
                    </div>

                    <div className="navbar-end">
                        <div className="navbar-item">
                            <div className="buttons">
                                <a className="button is-dark" href="#">Contact</a>
                                <a className="button is-dark" href="#quote">Request a Quote</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

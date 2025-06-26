import Image from 'next/image'
import transportStyles from '../styles/transport.module.scss'

export default function NavTransport({ children, home }) {
    return (
        <>
            <nav className={`navbar is-black is-fixed-top ${transportStyles['navbar-transport']}`} role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <a className="navbar-item" href="/transport">
                        <Image
                            priority
                            src="/images/transport_nav_logo.png"
                            height={40}
                            width={407}
                            alt="JW Motorcycle Transport"
                        />
                    </a>

                    <a
                        role="button"
                        className="navbar-burger"
                        aria-label="menu"
                        aria-expanded="false"
                        data-target="navbarBasicExample"
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbarBasicExample" className="navbar-menu">
                    <div className="navbar-start">
                        <a className="navbar-item">Services</a>
                        <a className="navbar-item">How It Works</a>
                        <a className="navbar-item">Prices</a>
                        <a className="navbar-item">About</a>
                        <a className="navbar-item">FAQ</a>
                        <a className="navbar-item">Reviews</a>
                    </div>

                    <div className="navbar-end">
                        <div className="navbar-item">
                            <div className="buttons">
                                <a className="button is-dark">
                                    Contact
                                </a>
                                <a className="button is-dark">Get a Quote</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}




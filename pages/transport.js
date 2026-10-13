import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout_transport'
import NavTransport from '../components/nav_transport'
import transportStyles from '../styles/transport.module.scss'
import QuoteForm from '../components/transport_quote_form'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'
import PricingCards from '../components/transport_pricing_cards'

export default function Transport({ transportData }) {

    return (
        <Layout transport>
            <Head>
                <title>JW Motorcycle Transport</title>
            </Head>

            <NavTransport />

            <div className="container" style={{ paddingTop: '8rem' }}>
                <section className={`section is-medium`}>
                    <div className="has-text-centered">
                        <Image
                            priority
                            src="/images/logo_transport.png"
                            height={278}
                            width={800}
                            alt="JW Motorcycle Transport"
                        />
                    </div>
                </section>
            </div>

            {/* HOME */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium has-text-centered">
                            <h1 className={`${transportStyles['ht']}`}><span className='has-text-grey'>JW</span> Motorcycle Transport You Can Trust</h1>
                            <p>Looking for a safe, reliable way to transport your motorcycle within Germany or across Europe? You've come to the right place. I offer professional motorbike transport services for private and business customers, whether you're buying or selling a bike, moving house, or heading to an event. Your motorcycle is handled with care, loaded professionally, and delivered door-to-door in a fully enclosed van.</p>
                            <p>I understand how much your bike means to you — that’s why I treat every vehicle like it’s my own. No matter where you are in Germany, I’ll get your motorcycle to its destination safely, securely, and on time.</p>
                            <p>
                                Based near Tübingen, operating throughout Germany and neighboring countries.<br />
                                Request a free quote today – fast replies, no obligation.
                            </p>

                            <a className="button is-dark is-medium" href="#quote">Request a Quote</a>

                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section id="services" className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>Services <small className='has-text-grey'>(What I Offer)</small></h2>
                                <p>I specialize in <strong>motorbike transportation services</strong> across Germany and neighboring regions. My van is fully equipped for motorcycle transport, including ramps, wheel chocks, and soft straps to ensure a smooth and secure journey for your bike.</p>
                                <p>Whether you’re a private rider, a workshop, or a dealer, I’ve got you covered:</p>
                                <strong>My core services include:</strong>
                                <ul>
                                    <li><strong>Private Motorcycle Transport</strong> – Bought or sold a bike? Let me handle pickup and delivery.</li>
                                    <li><strong>Event & Race Transport</strong> – Need your motorcycle at a track day, rally, or show? I’ll get it there, ready to ride.</li>
                                    <li><strong>Relocation Assistance</strong> – Moving house? I’ll move your bike with care.</li>
                                    <li><strong>Workshop Transfers</strong> – Bike needs work? I’ll transport it to your trusted mechanic or garage.</li>
                                    <li><strong>Anything Related to Moving Motorbikes</strong> – Need something else? If it involves a motorcycle, I’m happy to help. Just ask.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>How It Works <small className='has-text-grey'>(From A to B Without the Stress)</small></h2>
                                <p>My goal is to make <strong>motorbike transport as simple and worry-free as possible</strong>. Here's how the process works from start to finish:</p>

                                <div className="timeline">
                                    <header className="timeline-header">
                                        <span className="tag is-medium is-dark">Start</span>
                                    </header>
                                    <div className="timeline-item pb-0">
                                        <div className="timeline-marker is-icon">
                                            <FontAwesomeIcon icon={faFlag} />
                                        </div>
                                        <div className="timeline-content">
                                            <p className="has-text-weight-bold mb-1">Request a Quote</p>
                                            <p>Send me your transport details — pickup and drop-off locations, bike type, preferred dates, and anything special I should know.</p>
                                        </div>
                                    </div>

                                    <div className="timeline-item pb-0">
                                        <div className="timeline-marker is-icon">
                                            <FontAwesomeIcon icon={faFlag} />
                                        </div>
                                        <div className="timeline-content">
                                            <p className="has-text-weight-bold mb-1">I Confirm the Plan</p>
                                            <p>You’ll receive a clear quote and we’ll agree on a date and time. Once confirmed, we’re locked in.</p>
                                        </div>
                                    </div>

                                    <div className="timeline-item pb-0">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <p className="is-size-6">Note: Standard prices assume a flexible schedule, so I can plan your bike onto a route with other bookings. Need it on a specific date? Express options are also available.</p>
                                        </div>
                                    </div>

                                    <div className="timeline-item pb-0">
                                        <div className="timeline-marker is-icon">
                                            <FontAwesomeIcon icon={faFlag} />
                                        </div>
                                        <div className="timeline-content">
                                            <p className="has-text-weight-bold mb-1">I Collect Your Bike</p>
                                            <p>I arrive on time, load your motorcycle using a ramp and soft straps, and secure it carefully for transport in my van.</p>
                                        </div>
                                    </div>

                                    <div className="timeline-item pb-0">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <p className="is-size-6">In case of delays, I’ll keep you updated and can share my live location so you always know where your bike is.</p>
                                        </div>
                                    </div>

                                    <div className="timeline-item pb-3">
                                        <div className="timeline-marker is-icon">
                                            <FontAwesomeIcon icon={faFlag} />
                                        </div>
                                        <div className="timeline-content">
                                            <p className="has-text-weight-bold mb-1">I Deliver Your Bike</p>
                                            <p>At the other end, I unload your bike and hand it over safely. I’ll keep in touch during the journey and confirm delivery.</p>
                                        </div>
                                    </div>

                                    <header className="timeline-header">
                                        <span className="tag is-medium is-dark">Finish</span>
                                    </header>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* PRICING */}
            <section id="prices" className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>Prices <small className='has-text-grey'>(Fair & Transparent Motorcycle Transport Rates)</small></h2>
                                <p>I believe in clear and honest pricing. Every bike gets a fixed price based on just two things: <strong>the road distance from pickup to drop-off</strong> and <strong>the size of your bike</strong>. You don't pay for my drive to collect your bike or my drive home afterwards.</p>
                                <p>The price you're quoted is the price you pay. It won't change if other bookings are added to or removed from the route.</p>
                                <p>Bike size categories are a general reference. I'll confirm the category based on make, model, and weight when you request a quote. Extra charges only apply if your bike doesn't run, needs special handling, or comes with spare parts, and I'll always agree these with you upfront.</p>


                                <PricingCards />

                                <div className='has-text-centered'>

                                    <p className="mt-4">
                                        <span className="has-text-weight-bold">Please note</span>: These prices are for flexible, planned routes. I plan each trip so that several bikes travel together in the van, collecting and delivering them in the most efficient order. This keeps prices fair and reduces empty driving, but delivery may take a little longer while I plan a route that fits.
                                    </p>
                                    <p className="mt-4">
                                        If needed, I can store your motorcycle securely until delivery. If your transport is urgent or needs a fixed date or time window, I can still help. Your bike may need its own trip, so I'll calculate the price individually. Just mention it when you request a quote.
                                    </p>
                                    <p className="mt-4">
                                        <span className="has-text-weight-bold">For distances over 600 km or international deliveries</span>, prices depend on the actual route and will always be quoted individually.
                                    </p>
                                    <p className="mt-4">
                                        All transports include secure loading with soft straps, enclosed van transport, and basic insurance. If your bike doesn’t run, needs special handling, or you’re transporting extra parts, I’ll be happy to discuss the best options.
                                    </p>

                                    <a className="button is-dark is-medium" href="#quote">Request a Quote</a>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <div className="columns">
                                    <div className="column is-one-quarter">
                                        <div>
                                            <div>
                                                <figure className="image">
                                                    <Image
                                                        priority
                                                        src="/images/profile.jpg"
                                                        height={500}
                                                        width={500}
                                                        alt="Jon Williams"
                                                        className="is-rounded"
                                                    />
                                                </figure>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="column">
                                        <h2 className={`${transportStyles['ht']}`}>About <small className='has-text-grey'>(Passion for Motorbikes)</small></h2>
                                        <p>My name is Jon, and I’ve been passionate about motorbikes for as long as I can remember. What began as a hobby — transporting my own bikes and helping friends move theirs — has grown into a business built on reliability, attention to detail, and genuine respect for every motorcycle I handle.</p>
                                        <p>I’m not a faceless logistics company. I’m the person who answers your call, loads your bike, and delivers it personally. You’ll never have to deal with a call center or wonder where your bike is.</p>
                                        <p>I operate a clean, fully equipped van with professional securing gear, based near Tübingen and covering all of Germany and beyond. I make sure your bike arrives exactly as it left — safe, secure, and ready to ride.</p>
                                        <p>Whether it’s your daily ride, your pride and joy, or a new project bike, I’ll treat it with the same care I’d give my own.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>FAQ <small className='has-text-grey'>(Your Questions Answered)</small></h2>

                                <p className="has-text-weight-bold mt-5 mb-1">Do you cover all of Germany?</p>
                                <p>Yes – I offer motorcycle transport across all of Germany, including long-distance routes and trips to/from Austria, Switzerland, France, and the Netherlands.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">How is my price calculated?</p>
                                <p>Your price is based on the road distance from pickup to drop-off and the size of your bike (see <a href="#prices">Prices</a>). My travel to and from your bike isn't added on top. Because I plan routes so several bikes share the trip, I can keep prices lower than a dedicated single-bike transport.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">Why can delivery take a few days?</p>
                                <p>To keep prices low, I wait until I can plan a route that combines your bike with other bookings in the same direction. I'll always tell you the planned date in advance. If you need a specific date, ask for an express quote.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">Is the transport insured?</p>
                                <p>Yes, basic insurance is included in every transport. For high-value bikes, additional coverage can be arranged on request.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">Can you transport non-running bikes?</p>
                                <p>Absolutely – just let me know in advance. I have a winch and equipment to handle bikes that don’t start or roll.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">How far in advance should I book?</p>
                                <p>I recommend booking as early as possible, but I can often handle short-notice jobs depending on location and availability.</p>

                                <p className="has-text-weight-bold mt-5 mb-1">Can I include spare parts or accessories?</p>
                                <p>Yes, as long as they are securely packed. Please let me know what's included when booking. If there’s space available, I’m happy to transport them — just note that an extra charge may apply depending on the size and amount of items.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>


            <section id="quote" className="section">
                <div className="container">
                    <div className="content is-medium">
                        <h2 className={`${transportStyles['ht']}`}>Request a Quote</h2>
                        <QuoteForm />
                    </div>
                </div>
            </section>

        </Layout >
    )
}

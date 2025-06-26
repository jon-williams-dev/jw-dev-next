import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../apolloClient'
import Layout, { siteTitle } from '../components/layout_transport'
import NavTransport from '../components/nav_transport'
import transportStyles from '../styles/transport.module.scss'
import Link from 'next/link'
import Image from 'next/image'

export default function Bikes({ bikes }) {

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
                            <p>Looking for a safe, reliable way to transport your motorcycle within Germany or across Europe? You've come to the right place. We offer professional motorbike transport services for private and business customers, whether you're buying or selling a bike, moving house, or heading to an event. Your motorcycle is handled with care, loaded professionally, and delivered door-to-door in a fully enclosed van.</p>
                            <p>We understand how much your bike means to you — that’s why we treat every vehicle like it’s our own. No matter where you are in Germany, we’ll get your motorcycle to its destination safely, securely, and on time.</p>
                            <p>
                                Based near Tübingen, operating throughout Germany and neighboring countries.<br />
                                Request a free quote today – fast replies, no obligation.
                            </p>

                            <a className="button is-dark is-medium">
                                Get a Quote
                            </a>

                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>Services <small className='has-text-grey'>(What We Offer)</small></h2>
                                <p>We specialize in <strong>motorbike transportation services</strong> across Germany and neighboring regions. Our van is fully equipped for motorcycle transport, including ramps, wheel chocks, and soft straps to ensure a smooth and secure journey for your bike.</p>
                                <p>Whether you’re a private rider, a workshop, or a dealer, we’ve got you covered:</p>
                                <strong>Our core services include:</strong>
                                <ul>
                                    <li><strong>Private Motorcycle Transport</strong> – Bought or sold a bike? Let us handle pickup and delivery.</li>
                                    <li><strong>Event & Race Transport</strong> – Need your motorcycle at a track day, rally, or show? We’ll get it there, ready to ride.</li>
                                    <li><strong>Relocation Assistance</strong> – Moving house? We’ll move your bike with care.</li>
                                    <li><strong>Workshop Transfers</strong> – Bike needs work? We’ll transport it to your trusted mechanic or garage.</li>
                                    <li><strong>Anything Related to Moving Motorbikes</strong> – Need something else? If it involves a motorcycle, we’re happy to help. Just ask.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>How It Works <small className='has-text-grey'>(From A to B Without the Stress)</small></h2>
                                <p>Our goal is to make <strong>motorbike transport as simple and worry-free as possible</strong>. Here's how the process works from start to finish:</p>

                                <div class="timeline">
                                    <header class="timeline-header">
                                        <span class="tag is-medium is-dark">Start</span>
                                    </header>
                                    <div class="timeline-item pb-0">
                                        <div class="timeline-marker is-icon">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="has-text-weight-bold mb-1">You Get in Touch</p>
                                            <p>Send us your transport details — pickup and drop-off locations, bike type, preferred dates, and anything special we should know.</p>
                                        </div>
                                    </div>

                                    <div class="timeline-item pb-0">
                                        <div class="timeline-marker is-icon">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="has-text-weight-bold mb-1">We Confirm the Plan</p>
                                            <p>You’ll receive a clear quote and we’ll agree on a date and time. Once confirmed, we’re locked in.</p>
                                        </div>
                                    </div>

                                    <div class="timeline-item pb-0">
                                        <div class="timeline-marker">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="is-size-6">Depending on your flexibility and urgency, pickup and delivery may be scheduled alongside other customer routes to keep costs down.</p>
                                        </div>
                                    </div>

                                    <div class="timeline-item pb-0">
                                        <div class="timeline-marker is-icon">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="has-text-weight-bold mb-1">We Collect Your Bike</p>
                                            <p>We arrive on time, load your motorcycle using a ramp and soft straps, and secure it carefully for transport in our van.</p>
                                        </div>
                                    </div>

                                    <div class="timeline-item pb-0">
                                        <div class="timeline-marker">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="is-size-6">If there are any unexpected delays, we’ll keep you informed and can share our live location so you always know where we are.</p>
                                        </div>
                                    </div>

                                    <div class="timeline-item pb-3">
                                        <div class="timeline-marker is-icon">
                                            <i class="fa fa-flag"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <p class="has-text-weight-bold mb-1">We Deliver Your Bike</p>
                                            <p>At the other end, we unload your bike and hand it over safely. We’ll keep in touch during the journey and confirm delivery.</p>
                                        </div>
                                    </div>

                                    <header class="timeline-header">
                                        <span class="tag is-medium is-dark">Finish</span>
                                    </header>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* PRICING */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>Prices <small className='has-text-grey'>(Fair & Transparent Motorcycle Transport Rates)</small></h2>
                                <p>We believe in clear and honest pricing. The cost of transporting your motorcycle depends on the distance, vehicle type, and any special requirements — but we always aim to offer excellent value.</p>
                                <p><strong>Example Pricing:</strong></p>
                                <p>Our pricing depends on both distance and motorcycle size. The guide below gives a general idea, but final costs may vary depending on factors like non-running bikes, added parts, or special timing. Prices are based on flexible scheduling and route planning — urgent or fixed-time deliveries may cost more due to the additional logistics. Bike size categories are also a guide only; final classification depends on the make, model, and weight, which we’ll confirm when you request a quote.</p>

                                <div>
                                    <table className={`table is-hoverable is-fullwidth is-size-6 mb-6 mt-5 ${transportStyles['equal-width-table']}`}>
                                        <thead>
                                            <tr className={`${transportStyles['is-vcentered']}`}>
                                                <th>Distance</th>
                                                <th className='has-text-centered'>
                                                    Small<br />
                                                    <small className='heading has-text-weight-light'>Scooters / 50cc–125cc</small>
                                                </th>
                                                <th className='has-text-centered'>
                                                    Medium<br />
                                                    <small className='heading has-text-weight-light'>Standard / Naked / Touring</small>
                                                </th>
                                                <th className='has-text-centered'>
                                                    Large<br />
                                                    <small className='heading has-text-weight-light'> Adventure / Cruiser / heavy</small>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Up to 50 km</td>
                                                <td className='has-text-centered'>€79</td>
                                                <td className='has-text-centered'>€89</td>
                                                <td className='has-text-centered'>€99</td>
                                            </tr>
                                            <tr>
                                                <td>50 – 150 km</td>
                                                <td className='has-text-centered'>€129</td>
                                                <td className='has-text-centered'>€149</td>
                                                <td className='has-text-centered'>€169</td>
                                            </tr>
                                            <tr>
                                                <td>150 – 300 km</td>
                                                <td className='has-text-centered'>€199</td>
                                                <td className='has-text-centered'>€229</td>
                                                <td className='has-text-centered'>€249</td>
                                            </tr>
                                            <tr>
                                                <td>300 – 600 km</td>
                                                <td className='has-text-centered'>€299</td>
                                                <td className='has-text-centered'>€329</td>
                                                <td className='has-text-centered'>€359</td>
                                            </tr>
                                            <tr>
                                                <td>600+ km or international</td>
                                                <td className='has-text-centered' colspan="3"><small className='has-text-weight-bold'>Custom quote depending on destination and bike type</small></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>

                                <div className='has-text-centered'>
                                    <p>All transports include secure loading with soft straps, enclosed van transport, and basic insurance. For bikes that don’t run, or require extra handling, we’re happy to discuss options. Get in touch for a free, no - obligation quote:</p>
                                    <a className="button is-dark is-medium">
                                        Get a Quote
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section className="hero">
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
                                        <h2 className={`${transportStyles['ht']}`}>About <small className='has-text-grey'>(Passion for Motorbikes, Delivered Professionally)</small></h2>
                                        <p>My name is Jon, and I’ve been passionate about motorbikes for as long as I can remember. What began as a hobby — transporting my own bikes and helping friends move theirs — has grown into a business built on reliability, attention to detail, and genuine respect for every motorcycle I handle.</p>
                                        <p>I’m not a faceless logistics company. I’m the person who answers your call, loads your bike, and delivers it personally. You’ll never have to deal with a call center or wonder where your bike is.</p>
                                        <p>I operate a clean, fully equipped van with professional securing gear, based near Tübingen and covering all of Germany and beyond. I make sure your bike arrives exactly as it left — safe, secure, and ready to ride.</p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mb-6 mt-6">
                                <h2 className={`${transportStyles['ht']}`}>FAQ <small className='has-text-grey'>(Your Questions Answered)</small></h2>

                                <p class="has-text-weight-bold mt-5 mb-1">Do you cover all of Germany?</p>
                                <p>Yes – I offer motorcycle transport across all of Germany, including long-distance routes and trips to/from Austria, Switzerland, France, and the Netherlands.</p>

                                <p class="has-text-weight-bold mt-5 mb-1">Is the transport insured?</p>
                                <p>Yes, basic insurance is included in every transport. For high-value bikes, additional coverage can be arranged on request.</p>

                                <p class="has-text-weight-bold mt-5 mb-1">Can you transport non-running bikes?</p>
                                <p>Absolutely – just let me know in advance. I have a winch and equipment to handle bikes that don’t start or roll.</p>

                                <p class="has-text-weight-bold mt-5 mb-1">How far in advance should I book?</p>
                                <p>I recommend booking as early as possible, but I can often handle short-notice jobs depending on location and availability.</p>

                                <p class="has-text-weight-bold mt-5 mb-1">Can I include spare parts or accessories?</p>
                                <p>Yes, as long as they are securely packed. Please let me know what's included when booking. If there’s space available, I’m happy to transport them — just note that an extra charge may apply depending on the size and amount of items.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



        </Layout >
    )
}

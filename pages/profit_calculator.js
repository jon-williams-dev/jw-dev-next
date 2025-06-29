import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../apolloClient'
import Layout, { siteTitle } from '../components/layout_transport'
import NavTransport from '../components/nav_transport'
import transportStyles from '../styles/transport.module.scss'
import QuoteForm from '../components/transport_quote_form'
import SimpleQuoteCalculator from '../components/simple_quote_calculator'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfitCalculator({ }) {

    return (
        <Layout transport>
            <Head>
                <title>JW Motorcycle Transport</title>
            </Head>

            <NavTransport />



            <section id="prices" className="hero" style={{ paddingTop: '2rem' }}>
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium">
                            <div className="block mt-6">
                                <h2 className={`${transportStyles['ht']}`}>Estimate Your Profit</h2>

                                <div>
                                    <div className="columns is-multiline mb-4 mt-4">
                                        {/* Small */}
                                        <div className="column is-one-third">
                                            <div className={`card has-text-centered ${transportStyles['pricing-card']} ${transportStyles['pricing-small']}`}>
                                                <div className="card-content">
                                                    <p className="title is-5">Small</p>
                                                    <small className='subtitle heading has-text-weight-light has-text-grey pt-2'>Scooters / 50cc–125cc</small>
                                                    <ul className='is-size-6'>
                                                        <li>Up to 50 km – €139</li>
                                                        <li>50–150 km – €199</li>
                                                        <li>150–300 km – €279</li>
                                                        <li>300–600 km – €379</li>
                                                        <li className="has-text-grey-light">600+ km – Custom quote</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medium */}
                                        <div className="column is-one-third">
                                            <div className={`card has-text-centered ${transportStyles['pricing-card']} ${transportStyles['pricing-medium']}`}>
                                                <div className="card-content">
                                                    <p className="title is-5">Medium</p>
                                                    <small className='subtitle heading has-text-weight-light has-text-grey pt-2'>Standard / Naked / Touring</small>
                                                    <ul className='is-size-6'>
                                                        <li>Up to 50 km – €159</li>
                                                        <li>50–150 km – €229</li>
                                                        <li>150–300 km – €309</li>
                                                        <li>300–600 km – €409</li>
                                                        <li className="has-text-grey-light">600+ km – Custom quote</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Large */}
                                        <div className="column is-one-third">
                                            <div className={`card has-text-centered ${transportStyles['pricing-card']} ${transportStyles['pricing-large']}`}>
                                                <div className="card-content">
                                                    <p className="title is-5">Large</p>
                                                    <small className='subtitle heading has-text-weight-light has-text-grey pt-2'>Adventure / Cruiser / Heavy</small>
                                                    <ul className='is-size-6'>
                                                        <li>Up to 50 km – €169</li>
                                                        <li>50–150 km – €249</li>
                                                        <li>150–300 km – €339</li>
                                                        <li>300–600 km – €439</li>
                                                        <li className="has-text-grey-light">600+ km – Custom quote</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="block">
                                    <SimpleQuoteCalculator />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>



        </Layout >
    )
}

import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout_transport'
import NavTransport from '../components/nav_transport'
import transportStyles from '../styles/transport.module.scss'
import SimpleQuoteCalculator from '../components/simple_quote_calculator'
import PricingCards from '../components/transport_pricing_cards'

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

                                <PricingCards />

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

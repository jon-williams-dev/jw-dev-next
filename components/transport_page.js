import Head from 'next/head'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'
import Layout from './layout_transport'
import NavTransport from './nav_transport'
import QuoteForm from './transport_quote_form'
import PricingCards from './transport_pricing_cards'
import transportStyles from '../styles/transport.module.scss'
import { CONTENT, LANGS } from './transport_content'
import { PRICE_TIERS } from '../lib/transport_pricing'
import { TRANSPORT_URL } from '../lib/transport_domains'

const Heading = ({ title, subtitle }) => (
    <h2 className={transportStyles['ht']}>{title} <small className='has-text-grey'>{subtitle}</small></h2>
)

const Section = ({ id, children }) => (
    <section id={id} className="hero">
        <div className="hero-body">
            <div className="container">
                <div className="content is-medium">
                    <div className="block mb-6 mt-6">{children}</div>
                </div>
            </div>
        </div>
    </section>
)

function structuredData(lang, t) {
    const url = `${TRANSPORT_URL}${LANGS[lang].publicPath}`
    const prices = PRICE_TIERS.flatMap((tier) => Object.values(tier.prices))
    const business = {
        '@type': 'LocalBusiness',
        '@id': `${TRANSPORT_URL}/#business`,
        name: t.meta.siteName,
        description: t.meta.description,
        url,
        image: `${TRANSPORT_URL}/images/logo_transport.png`,
        logo: `${TRANSPORT_URL}/images/logo_transport.png`,
        email: 'jon.williams@hey.com',
        founder: { '@type': 'Person', name: 'Jon Williams' },
        address: { '@type': 'PostalAddress', addressRegion: 'Baden-Württemberg', addressCountry: 'DE' },
        areaServed: ['Germany', 'Austria', 'Switzerland', 'France', 'Netherlands', 'Europe']
            .map((name) => ({ '@type': 'Place', name })),
        priceRange: `€${Math.min(...prices)}–€${Math.max(...prices)}`,
        currenciesAccepted: 'EUR',
    }
    const service = {
        '@type': 'Service',
        name: t.meta.siteName,
        serviceType: lang === 'de' ? 'Motorradtransport' : 'Motorcycle transport',
        provider: { '@id': business['@id'] },
        areaServed: business.areaServed,
        url,
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
        },
    }
    const faq = {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: t.faq.items.map(([question, answer, plainAnswer]) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: plainAnswer || answer },
        })),
    }
    return { '@context': 'https://schema.org', '@graph': [business, service, faq] }
}

export default function TransportPage({ lang }) {
    const t = CONTENT[lang]
    const lastStep = t.howItWorks.steps.length - 1

    return (
        <Layout lang={lang} seo>
            <Head>
                <title>{t.meta.title}</title>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang, t)) }}
                />
            </Head>

            <NavTransport lang={lang} />

            <div className="container" style={{ paddingTop: '8rem' }}>
                <section className="section is-medium">
                    <div className="has-text-centered">
                        <Image
                            priority
                            src="/images/logo_transport.png"
                            height={278}
                            width={800}
                            alt={`${t.meta.siteName} logo`}
                        />
                    </div>
                </section>
            </div>

            {/* HOME */}
            <section className="hero">
                <div className="hero-body">
                    <div className="container">
                        <div className="content is-medium has-text-centered">
                            <h1 className={transportStyles['ht']}>{t.hero.title}</h1>
                            {t.hero.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                            <a className="button is-dark is-medium" href="#quote">{t.nav.requestQuote}</a>
                        </div>
                    </div>
                </div>
            </section>

            <Section id="services">
                <Heading {...t.services} />
                {t.services.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                <strong>{t.services.listTitle}</strong>
                <ul>
                    {t.services.items.map(([title, text]) => (
                        <li key={title}><strong>{title}</strong> – {text}</li>
                    ))}
                </ul>
            </Section>

            <Section id="how-it-works">
                <Heading {...t.howItWorks} />
                <p>{t.howItWorks.intro}</p>

                <div className="timeline">
                    <header className="timeline-header">
                        <span className="tag is-medium is-dark">{t.howItWorks.start}</span>
                    </header>
                    {t.howItWorks.steps.map((step, i) => (
                        <div className={`timeline-item ${i === lastStep ? 'pb-3' : 'pb-0'}`} key={i}>
                            {step.note ? (
                                <>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <p className="is-size-6">{step.note}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="timeline-marker is-icon">
                                        <FontAwesomeIcon icon={faFlag} />
                                    </div>
                                    <div className="timeline-content">
                                        <p className="has-text-weight-bold mb-1">{step.title}</p>
                                        <p>{step.text}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <header className="timeline-header">
                        <span className="tag is-medium is-dark">{t.howItWorks.finish}</span>
                    </header>
                </div>
            </Section>

            <Section id="prices">
                <Heading {...t.prices} />
                {t.prices.intro.map((p, i) => <p key={i}>{p}</p>)}

                <PricingCards labels={t.prices.cards} />

                <div className='has-text-centered'>
                    {t.prices.notes.map((p, i) => <p className="mt-4" key={i}>{p}</p>)}
                    <a className="button is-dark is-medium" href="#quote">{t.nav.requestQuote}</a>
                </div>
            </Section>

            <Section id="about">
                <div className="columns">
                    <div className="column is-one-quarter">
                        <figure className="image">
                            <Image
                                src="/images/profile.jpg"
                                height={500}
                                width={500}
                                alt="Jon Williams"
                                className="is-rounded"
                            />
                        </figure>
                    </div>
                    <div className="column">
                        <Heading {...t.about} />
                        {t.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                </div>
            </Section>

            <Section id="faq">
                <Heading {...t.faq} />
                {t.faq.items.map(([q, a]) => (
                    <div key={q}>
                        <p className="has-text-weight-bold mt-5 mb-1">{q}</p>
                        <p>{a}</p>
                    </div>
                ))}
            </Section>

            <section id="quote" className="section">
                <div className="container">
                    <div className="content is-medium">
                        <h2 className={transportStyles['ht']}>{t.quote.title}</h2>
                        <QuoteForm lang={lang} />
                    </div>
                </div>
            </section>
        </Layout>
    )
}

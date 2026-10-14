import transportStyles from '../styles/transport.module.scss'
import { BIKE_SIZES, PRICE_TIERS } from '../lib/transport_pricing'
import { CONTENT } from './transport_content'

export default function PricingCards({ labels = CONTENT.en.prices.cards }) {
    const lastMax = PRICE_TIERS[PRICE_TIERS.length - 1].max
    const tierLabel = ({ min, max }) => (min === 0 ? `${labels.upTo} ${max} km` : `${min}–${max} km`)

    return (
        <div className="columns is-multiline mb-4 mt-4">
            {BIKE_SIZES.map(({ key, style }) => {
                const [name, description] = labels.sizes[key]
                return (
                    <div className="column is-one-third" key={key}>
                        <div className={`card has-text-centered ${transportStyles['pricing-card']} ${transportStyles[style]}`}>
                            <div className="card-content">
                                <p className="title is-5">{name}</p>
                                <small className='subtitle heading has-text-weight-light has-text-grey pt-2'>{description}</small>
                                <ul className='is-size-6'>
                                    {PRICE_TIERS.map((tier) => (
                                        <li key={tier.max}>{tierLabel(tier)} – €{tier.prices[key]}</li>
                                    ))}
                                    <li className="has-text-grey-light">{lastMax}+ km – {labels.customQuote}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

import transportStyles from '../styles/transport.module.scss'
import { BIKE_SIZES, PRICE_TIERS } from '../lib/transport_pricing'

const tierLabel = ({ min, max }) => (min === 0 ? `Up to ${max} km` : `${min}–${max} km`)

export default function PricingCards() {
    const lastMax = PRICE_TIERS[PRICE_TIERS.length - 1].max

    return (
        <div className="columns is-multiline mb-4 mt-4">
            {BIKE_SIZES.map(({ key, label, style }) => (
                <div className="column is-one-third" key={key}>
                    <div className={`card has-text-centered ${transportStyles['pricing-card']} ${transportStyles[style]}`}>
                        <div className="card-content">
                            <p className="title is-5">{key}</p>
                            <small className='subtitle heading has-text-weight-light has-text-grey pt-2'>{label}</small>
                            <ul className='is-size-6'>
                                {PRICE_TIERS.map((tier) => (
                                    <li key={tier.max}>{tierLabel(tier)} – €{tier.prices[key]}</li>
                                ))}
                                <li className="has-text-grey-light">{lastMax}+ km – Custom quote</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

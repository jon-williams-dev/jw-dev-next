import { useState } from 'react'

export default function CostCalculator() {
    const [customerDistance, setCustomerDistance] = useState('')
    const [yourDistance, setYourDistance] = useState('')
    const [bikeSize, setBikeSize] = useState('Medium')

    const getCustomerPrice = (distance, size) => {
        const d = Number(distance)
        if (isNaN(d)) return 0

        const pricing = {
            Small: [
                { max: 50, price: 139 },
                { max: 150, price: 199 },
                { max: 300, price: 279 },
                { max: 600, price: 379 },
            ],
            Medium: [
                { max: 50, price: 159 },
                { max: 150, price: 229 },
                { max: 300, price: 309 },
                { max: 600, price: 409 },
            ],
            Large: [
                { max: 50, price: 169 },
                { max: 150, price: 249 },
                { max: 300, price: 339 },
                { max: 600, price: 439 },
            ],
        }

        const sizeTiers = pricing[size] || []
        for (let tier of sizeTiers) {
            if (d <= tier.max) return tier.price
        }

        // Tiered pricing for over 600 km
        const base = 460
        let extraRate = 1.25
        if (d > 800) extraRate = 1.35
        const extraKm = d - 600
        return Math.round(base + extraKm * extraRate)
    }

    const getFuelCost = (yourKm) => {
        const km = Number(yourKm)
        if (isNaN(km)) return 0
        const costPerKm = 0.18 // approx. 9L/100km at €2.00/L
        return Math.round(km * costPerKm)
    }

    const getDrivingTime = (yourKm) => {
        const km = Number(yourKm)
        if (isNaN(km)) return 0
        return (km / 80 + 1).toFixed(1) // Assume 80 km/h avg speed + 1 hr loading
    }

    const getSuggestedPrice = (fuelCost, time) => {
        const desiredHourlyRate = 50
        const targetProfit = Math.round(time * desiredHourlyRate)
        return fuelCost + targetProfit
    }

    const price = getCustomerPrice(customerDistance, bikeSize)
    const dieselCost = getFuelCost(yourDistance)
    const profit = price - dieselCost
    const timeEstimate = parseFloat(getDrivingTime(yourDistance))
    const minimumAcceptable = getSuggestedPrice(dieselCost, timeEstimate)

    const isUnprofitable = profit < minimumAcceptable

    return (
        <div className="box">
            <h2 className="title is-4">Transport Profit Estimator</h2>

            <div className="field">
                <label className="label">Customer Distance (A → B in km)</label>
                <div className="control">
                    <input
                        className="input"
                        type="number"
                        value={customerDistance}
                        onChange={(e) => setCustomerDistance(e.target.value)}
                    />
                </div>
            </div>

            <div className="field">
                <label className="label">Your Total Distance (Home → A → B → Home)</label>
                <div className="control">
                    <input
                        className="input"
                        type="number"
                        value={yourDistance}
                        onChange={(e) => setYourDistance(e.target.value)}
                    />
                </div>
            </div>

            <div className="field">
                <label className="label">Bike Size</label>
                <div className="control">
                    <div className="select">
                        <select value={bikeSize} onChange={(e) => setBikeSize(e.target.value)}>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr />

            <div className="content">
                <p><strong>Customer Price:</strong> €{price}</p>
                <p><strong>Diesel Cost:</strong> €{dieselCost}</p>
                <p><strong>Estimated Profit:</strong> €{profit}</p>
                <p><strong>Estimated Time:</strong> {timeEstimate} hours</p>

                {isUnprofitable && (
                    <article className="message is-warning mt-4">
                        <div className="message-body">
                            This trip may not be profitable.<br />
                            Suggested minimum charge (to earn €50/hour): <strong>€{minimumAcceptable}</strong><br />
                            Consider bundling deliveries or waiting for other jobs to reduce costs.
                        </div>
                    </article>
                )}
            </div>
        </div>
    )
}

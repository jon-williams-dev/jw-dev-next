import { useState } from 'react'
import { COSTS, BIKE_SIZES, fuelCostPerKm, getCustomerPrice } from '../lib/transport_pricing'

const MAX_BIKES = 8
const newBike = () => ({ pickup: '', dropoff: '', size: 'Medium' })

export default function CostCalculator() {
    const [home, setHome] = useState(COSTS.homeAddress)
    const [capacity, setCapacity] = useState(COSTS.vanCapacity)
    const [dieselPrice, setDieselPrice] = useState(COSTS.dieselPerLitre)
    const [bikes, setBikes] = useState([newBike()])
    const [route, setRoute] = useState(null)
    const [status, setStatus] = useState(null)
    const [error, setError] = useState('')

    const updateBike = (i, field, value) => {
        setBikes(bikes.map((b, j) => (j === i ? { ...b, [field]: value } : b)))
        if (field !== 'size') setRoute(null)
    }
    const addBike = () => { setBikes([...bikes, newBike()]); setRoute(null) }
    const removeBike = (i) => { setBikes(bikes.filter((_, j) => j !== i)); setRoute(null) }

    const calculate = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setError('')
        setRoute(null)
        try {
            const res = await fetch('/api/route_plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ home, capacity, bikes }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setRoute(data)
            setStatus(null)
        } catch (err) {
            setError(err.message || 'Something went wrong')
            setStatus('error')
        }
    }

    const n = bikes.length
    const stopLabel = (node) => {
        if (node === 0) return 'Home'
        if (node <= n) return `Pick up bike ${node}`
        return `Drop off bike ${node - n}`
    }

    let summary = null
    if (route) {
        const prices = route.bikeKm.map((km, i) => getCustomerPrice(km, bikes[i].size))
        const revenue = prices.reduce((s, p) => s + p, 0)
        const km = route.totalKm
        const dieselCost = Math.round(km * fuelCostPerKm(Number(dieselPrice) || 0))
        const wearCost = Math.round(km * COSTS.wearPerKm)
        const hours = route.totalDriveHours * COSTS.driveTimeFactor + n * COSTS.handlingHoursPerBike
        const profit = revenue - dieselCost - wearCost
        const minimumAcceptable = Math.round(dieselCost + wearCost + hours * COSTS.hourlyRate)
        const mapsUrl = 'https://www.google.com/maps/dir/?api=1'
            + `&origin=${encodeURIComponent(home)}`
            + `&destination=${encodeURIComponent(home)}`
            + `&waypoints=${encodeURIComponent(route.order.slice(1, -1).map((node) => route.points[node].address).join('|'))}`
            + '&travelmode=driving'
        summary = { prices, revenue, km, dieselCost, wearCost, hours, profit, minimumAcceptable, mapsUrl }
    }

    return (
        <div className="box">
            <h2 className="title is-4">Transport Profit Estimator</h2>

            <form onSubmit={calculate}>
                <div className="columns">
                    <div className="column is-half">
                        <div className="field">
                            <label className="label">Start / End (Home)</label>
                            <div className="control">
                                <input className="input" type="text" value={home} required
                                    onChange={(e) => { setHome(e.target.value); setRoute(null) }} />
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="field">
                            <label className="label">Van Capacity (bikes)</label>
                            <div className="control">
                                <input className="input" type="number" min="1" max={MAX_BIKES} value={capacity} required
                                    onChange={(e) => { setCapacity(e.target.value); setRoute(null) }} />
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="field">
                            <label className="label">Diesel (€ / litre)</label>
                            <div className="control">
                                <input className="input" type="number" step="0.01" value={dieselPrice}
                                    onChange={(e) => setDieselPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {bikes.map((bike, i) => (
                    <div className="columns is-vcentered mb-0" key={i}>
                        <div className="column is-narrow has-text-weight-bold">Bike {i + 1}</div>
                        <div className="column">
                            <input className="input" type="text" placeholder="Pickup address" value={bike.pickup} required
                                onChange={(e) => updateBike(i, 'pickup', e.target.value)} />
                        </div>
                        <div className="column">
                            <input className="input" type="text" placeholder="Drop-off address" value={bike.dropoff} required
                                onChange={(e) => updateBike(i, 'dropoff', e.target.value)} />
                        </div>
                        <div className="column is-narrow">
                            <div className="select">
                                <select value={bike.size} onChange={(e) => updateBike(i, 'size', e.target.value)}>
                                    {BIKE_SIZES.map(({ key }) => <option key={key} value={key}>{key}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="column is-narrow">
                            <button type="button" className="delete" aria-label={`Remove bike ${i + 1}`}
                                disabled={bikes.length === 1} onClick={() => removeBike(i)} />
                        </div>
                    </div>
                ))}

                <div className="buttons mt-4">
                    <button type="button" className="button is-light" onClick={addBike} disabled={bikes.length >= MAX_BIKES}>
                        + Add bike
                    </button>
                    <button type="submit" className={`button is-dark ${status === 'loading' ? 'is-loading' : ''}`}
                        disabled={status === 'loading'}>
                        Calculate route
                    </button>
                </div>
                {status === 'loading' && <p className="help">Looking up addresses (about 1 second per address)…</p>}
                {status === 'error' && <p className="has-text-danger has-text-weight-bold">{error}</p>}
            </form>

            {summary && (
                <>
                    <hr />
                    <div className="content">
                        <h3 className="title is-5">Bikes</h3>
                        <table className="table is-fullwidth is-narrow">
                            <thead>
                                <tr><th>#</th><th>From → To</th><th>Size</th><th>Distance</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {bikes.map((bike, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{bike.pickup} → {bike.dropoff}</td>
                                        <td>{bike.size}</td>
                                        <td>{Math.round(route.bikeKm[i])} km</td>
                                        <td>€{summary.prices[i]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 className="title is-5">Shortest Route</h3>
                        <ol>
                            {route.legs.map((leg, i) => (
                                <li key={i}>
                                    {stopLabel(leg.from)} → <strong>{stopLabel(leg.to)}</strong>
                                    {leg.to !== 0 && <span className="has-text-grey"> ({route.points[leg.to].address})</span>}
                                    {' '}– {Math.round(leg.km)} km
                                </li>
                            ))}
                        </ol>
                        <p><a href={summary.mapsUrl} target="_blank" rel="noopener noreferrer">Open route in Google Maps</a></p>

                        <h3 className="title is-5">Trip Totals</h3>
                        <p><strong>Revenue:</strong> €{summary.revenue}</p>
                        <p><strong>Total Distance:</strong> {Math.round(summary.km)} km</p>
                        <p><strong>Diesel Cost:</strong> €{summary.dieselCost}</p>
                        <p><strong>Van Wear (€{COSTS.wearPerKm.toFixed(2)}/km):</strong> €{summary.wearCost}</p>
                        <p><strong>Estimated Profit:</strong> €{summary.profit}</p>
                        <p>
                            <strong>Estimated Time:</strong> {summary.hours.toFixed(1)} hours
                            (≈ €{Math.round(summary.profit / summary.hours)}/hour)
                        </p>

                        {summary.revenue < summary.minimumAcceptable && (
                            <article className="message is-warning mt-4">
                                <div className="message-body">
                                    This trip may not be profitable.<br />
                                    Minimum to earn €{COSTS.hourlyRate}/hour: <strong>€{summary.minimumAcceptable}</strong>
                                    {' '}(€{summary.minimumAcceptable - summary.revenue} short).<br />
                                    Consider adding more bikes along the route.
                                </div>
                            </article>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

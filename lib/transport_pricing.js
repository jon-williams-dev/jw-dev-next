export const COSTS = {
    dieselPerLitre: 2.0, // € per litre, update when pump prices move
    litresPer100km: 9,
    wearPerKm: 0.10, // tyres, servicing, depreciation
    driveTimeFactor: 1.15, // routing times are for cars; a loaded van is slower
    handlingHoursPerBike: 1, // loading + unloading
    hourlyRate: 50,
    homeAddress: '72108 Kiebingen',
    vanCapacity: 3,
}

export const fuelCostPerKm = (dieselPerLitre = COSTS.dieselPerLitre) =>
    (COSTS.litresPer100km / 100) * dieselPerLitre

export const BIKE_SIZES = [
    { key: 'Small', style: 'pricing-small' },
    { key: 'Medium', style: 'pricing-medium' },
    { key: 'Large', style: 'pricing-large' },
]

// Short tiers cover a solo trip; longer tiers assume the trip is shared with other bookings.
export const PRICE_TIERS = [
    { min: 0, max: 50, prices: { Small: 149, Medium: 169, Large: 189 } },
    { min: 50, max: 150, prices: { Small: 259, Medium: 279, Large: 299 } },
    { min: 150, max: 300, prices: { Small: 399, Medium: 429, Large: 459 } },
    { min: 300, max: 600, prices: { Small: 599, Medium: 649, Large: 689 } },
]

const LONG_DISTANCE_PER_KM = 1.10

export function getCustomerPrice(distanceKm, size) {
    const d = Number(distanceKm)
    if (!d || d < 0) return 0

    const tier = PRICE_TIERS.find((t) => d <= t.max)
    if (tier) return tier.prices[size]

    const last = PRICE_TIERS[PRICE_TIERS.length - 1]
    return Math.round(last.prices[size] + (d - last.max) * LONG_DISTANCE_PER_KM)
}

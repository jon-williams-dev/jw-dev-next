// Node layout: 0 = home, 1..n = pickups, n+1..2n = drop-offs.
// Exact DP over (visited set, current stop): fine up to ~8 bikes.
export function optimizeRoute(dist, n, capacity) {
    const stops = 2 * n
    const full = (1 << stops) - 1
    const size = 1 << stops
    const cost = Array.from({ length: size }, () => new Float64Array(stops + 1).fill(Infinity))
    const prev = Array.from({ length: size }, () => new Int16Array(stops + 1).fill(-1))

    const isPicked = (mask, i) => (mask >> (i - 1)) & 1
    const isDropped = (mask, i) => (mask >> (n + i - 1)) & 1
    const load = (mask) => {
        let l = 0
        for (let i = 1; i <= n; i++) if (isPicked(mask, i) && !isDropped(mask, i)) l++
        return l
    }

    for (let i = 1; i <= n; i++) cost[1 << (i - 1)][i] = dist[0][i]

    for (let mask = 1; mask <= full; mask++) {
        const inVan = load(mask)
        for (let last = 1; last <= stops; last++) {
            const c = cost[mask][last]
            if (c === Infinity) continue
            for (let next = 1; next <= stops; next++) {
                const bit = 1 << (next - 1)
                if (mask & bit) continue
                const isPickup = next <= n
                if (isPickup && inVan >= capacity) continue
                if (!isPickup && !isPicked(mask, next - n)) continue
                const nc = c + dist[last][next]
                if (nc < cost[mask | bit][next]) {
                    cost[mask | bit][next] = nc
                    prev[mask | bit][next] = last
                }
            }
        }
    }

    let best = Infinity
    let bestLast = -1
    for (let last = n + 1; last <= stops; last++) {
        const total = cost[full][last] + dist[last][0]
        if (total < best) {
            best = total
            bestLast = last
        }
    }
    if (bestLast === -1) return null

    const order = []
    let mask = full
    let node = bestLast
    while (node > 0) {
        order.unshift(node)
        const p = prev[mask][node]
        mask &= ~(1 << (node - 1))
        node = p
    }
    return [0, ...order, 0]
}

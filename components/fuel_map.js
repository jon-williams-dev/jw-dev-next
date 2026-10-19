import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Green for the cheapest, red for the most expensive.
const GERMANY = [51.16, 10.45]

const priceColor = (p, min, max) => `hsl(${Math.round(140 * (1 - (max > min ? (p - min) / (max - min) : 0)))}, 65%, 38%)`

// Leaflet touches `window`, so it is loaded only in the browser.
// `selected` is a fresh { id } object per tap, so re-tapping the same station recentres again.
// The map may sit in a hidden pane on mobile, so the wanted view is kept and applied once it has a size.
export default function FuelMap({ center, rad, stations, fuel, cheapestId, selected, directionsUrl }) {
    const el = useRef(null)
    const map = useRef(null)
    const layer = useRef(null)
    const markers = useRef({})
    const view = useRef(null)
    const [L, setL] = useState(null)

    const applyView = () => {
        if (!map.current || !view.current || !el.current?.offsetHeight) return
        map.current.invalidateSize()
        view.current()
    }

    useEffect(() => {
        let cancelled = false
        let wasHidden = false
        const observer = new ResizeObserver(() => {
            const hidden = !el.current?.offsetHeight
            if (wasHidden && !hidden) applyView()
            else map.current?.invalidateSize()
            wasHidden = hidden
        })
        import('leaflet').then(({ default: leaflet }) => {
            if (cancelled || map.current) return
            map.current = leaflet.map(el.current, { scrollWheelZoom: false, zoomControl: false })
            leaflet.control.zoom({ position: 'bottomright' }).addTo(map.current)
            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map.current)
            layer.current = leaflet.layerGroup().addTo(map.current)
            wasHidden = !el.current.offsetHeight
            observer.observe(el.current)
            setL(leaflet)
        })
        return () => {
            cancelled = true
            observer.disconnect()
            map.current?.remove()
            map.current = null
            setL(null)
        }
    }, [])

    useEffect(() => {
        if (!L || !map.current) return
        layer.current.clearLayers()
        markers.current = {}

        // No search yet: show the whole country.
        if (!center) {
            view.current = () => map.current.setView(GERMANY, 6)
            if (!el.current.offsetHeight) map.current.setView(GERMANY, 6)
            applyView()
            return
        }

        L.circle([center.lat, center.lng], { radius: rad * 1000, color: '#3273dc', weight: 1, fillOpacity: 0.04, interactive: false }).addTo(layer.current)
        L.circleMarker([center.lat, center.lng], { radius: 7, color: '#fff', weight: 2, fillColor: '#3273dc', fillOpacity: 1, interactive: false }).addTo(layer.current)

        const prices = stations.map((s) => s[fuel])
        const min = Math.min(...prices)
        const max = Math.max(...prices)

        // Draw expensive first so the cheapest labels sit on top.
        ;[...stations].sort((a, b) => b[fuel] - a[fuel]).forEach((s) => {
            const best = s.id === cheapestId
            const icon = L.divIcon({
                className: '',
                iconSize: null,
                popupAnchor: [0, -28],
                html: `<div style="transform:translate(-50%,-100%);background:${priceColor(s[fuel], min, max)};color:#fff;font-weight:600;font-size:${best ? 15 : 13}px;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.35);${best ? 'outline:2px solid #fff;' : ''}">${best ? '★ ' : ''}€${s[fuel].toFixed(3)}</div>`,
            })
            const marker = L.marker([s.lat, s.lng], { icon, zIndexOffset: best ? 1000 : 0 })
                .bindPopup(`<div style="font-size:14px;line-height:1.4"><strong>${esc(s.brand)}</strong><br>${esc(s.address)}, ${esc(s.place)}<br><strong>€${s[fuel].toFixed(3)}</strong> · ${s.dist} km${s.isOpen ? '' : ' · <em>closed</em>'}</div><a href="${esc(directionsUrl(s))}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:8px;padding:8px 12px;background:#3273dc;color:#fff;border-radius:6px;text-align:center;font-weight:600">Directions</a>`, { minWidth: 200 })
                .addTo(layer.current)
            markers.current[s.id] = marker
        })

        // circle.getBounds() needs a map that already has a view, so compute the bounds directly.
        const bounds = L.latLng(center.lat, center.lng).toBounds(rad * 2000)
        view.current = () => map.current.fitBounds(bounds, { padding: [10, 10] })
        // Leaflet needs some view before markers render, even while hidden.
        if (!el.current.offsetHeight) map.current.setView([center.lat, center.lng], 12)
        applyView()
    }, [L, center?.lat, center?.lng, rad, stations, fuel, cheapestId])

    useEffect(() => {
        const marker = markers.current[selected?.id]
        if (!marker || !map.current) return
        view.current = () => {
            map.current.setView(marker.getLatLng(), Math.max(map.current.getZoom(), 15))
            marker.openPopup()
        }
        applyView()
    }, [selected, L])

    return <div ref={el} style={{ height: '100%', minHeight: 300, borderRadius: 8, zIndex: 0 }} />
}

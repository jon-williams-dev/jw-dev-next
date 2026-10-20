import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Layout from '../components/layout'
import FuelSearch from '../components/fuel_search'

const FuelMap = dynamic(() => import('../components/fuel_map'), { ssr: false })

const FUELS = [
    { key: 'e5', label: 'Super E5', short: 'E5' },
    { key: 'e10', label: 'Super E10', short: 'E10' },
    { key: 'diesel', label: 'Diesel', short: 'Diesel' },
]
const RADII = [2, 5, 10, 15, 25]
const PREFS_KEY = 'tanken:prefs'

const loadPrefs = () => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {} } catch { return {} }
}
const savePrefs = (prefs) => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch { }
}

// Pump style: 1.72⁹
function Price({ value, large }) {
    if (!value) return <span className="has-text-grey-light">–</span>
    const [whole, cents] = value.toFixed(3).split('.')
    return (
        <span style={{ fontSize: large ? '2.25rem' : '1.35rem', fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
            €{whole}.{cents.slice(0, 2)}<sup style={{ fontSize: '0.6em' }}>{cents[2]}</sup>
        </span>
    )
}

// iPhones get Apple Maps; everything else Google Maps (opens the app when installed).
const directionsUrl = (s) => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
    ? `https://maps.apple.com/?daddr=${s.lat},${s.lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=driving`
const km = (d) => `${d.toLocaleString('en-GB', { maximumFractionDigits: 1 })} km`
const time = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches

export default function Tanken() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [fuel, setFuel] = useState('e10')
    const [rad, setRad] = useState(10)
    const [sort, setSort] = useState('price')
    const [openOnly, setOpenOnly] = useState(true)
    const [brands, setBrands] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState(null)
    const [selected, setSelected] = useState(null)
    const [view, setView] = useState('list')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [ready, setReady] = useState(false)
    const panesRef = useRef(null)

    // Shared URL params win over the filters remembered on this device.
    useEffect(() => {
        if (!router.isReady) return
        const p = router.query
        const prefs = loadPrefs()
        const f = FUELS.some((x) => x.key === p.fuel) ? p.fuel : FUELS.some((x) => x.key === prefs.fuel) ? prefs.fuel : 'e10'
        const r = RADII.includes(Number(p.radius)) ? Number(p.radius) : RADII.includes(prefs.rad) ? prefs.rad : 10
        setFuel(f)
        setRad(r)
        setSort((p.sort || prefs.sort) === 'dist' ? 'dist' : 'price')
        setOpenOnly((p.open ?? (prefs.openOnly === false ? '0' : '1')) !== '0')
        if (p.q) {
            setQuery(p.q)
            search({ q: p.q }, r, true)
        } else if (prefs.q) {
            setQuery(prefs.q)
        }
        setReady(true)
    }, [router.isReady])

    useEffect(() => {
        if (!ready) return
        savePrefs({ fuel, rad, sort, openOnly, q: result?.query ?? loadPrefs().q })
        const q = { fuel, radius: rad, sort, open: openOnly ? '1' : '0' }
        if (result?.query) q.q = result.query
        router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true, scroll: false })
    }, [ready, fuel, rad, sort, openOnly, result?.query])

    async function search(params, radius = rad, fresh = false, reason = 'stations') {
        setLoading(reason)
        setError(null)
        try {
            const qs = new URLSearchParams({ ...params, rad: radius })
            const res = await fetch(`/api/tanken?${qs}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setResult({ ...data, query: params.q || null, params })
            setSelected(null)
            if (fresh) {
                setBrands([])
                setView('list')
            }
        } catch (e) {
            setError(e.message || 'Search failed')
        } finally {
            setLoading(null)
        }
    }

    function locate() {
        if (!navigator.geolocation) return setError('Location is not available in this browser. Enter a town or postcode instead.')
        setLoading('location')
        setError(null)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setQuery('')
                search({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }, rad, true)
            },
            () => {
                setLoading(null)
                setError('Could not get your location. Check location permissions, or enter a town or postcode.')
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
        )
    }

    function changeRadius(r) {
        setRad(r)
        if (result) search(result.params, r)
    }

    function switchView(v) {
        setView(v)
        panesRef.current?.scrollIntoView({ block: 'start' })
    }

    function showOnMap(id) {
        setSelected({ id })
        if (!isDesktop()) switchView('map')
    }

    const allBrands = useMemo(
        () => [...new Set((result?.stations || []).map((s) => s.brand))].sort((a, b) => a.localeCompare(b)),
        [result],
    )

    const list = useMemo(() => {
        const stations = (result?.stations || []).filter((s) =>
            s[fuel] && (!openOnly || s.isOpen) && (!brands.length || brands.includes(s.brand)))
        return stations.sort((a, b) => sort === 'dist' ? a.dist - b.dist : a[fuel] - b[fuel] || a.dist - b.dist)
    }, [result, fuel, openOnly, brands, sort])

    const prices = list.map((s) => s[fuel])
    const cheapest = list.length ? list.reduce((a, b) => (b[fuel] < a[fuel] || (b[fuel] === a[fuel] && b.dist < a.dist) ? b : a)) : null
    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null
    const fuelLabel = FUELS.find((f) => f.key === fuel).label
    const filterSummary = [`${rad} km`, sort === 'price' ? 'Cheapest first' : 'Nearest first', openOnly && 'Open', brands.length && `${brands.length} brand${brands.length > 1 ? 's' : ''}`].filter(Boolean).join(' · ')

    const toggleBrand = (b) => setBrands((bs) => bs.includes(b) ? bs.filter((x) => x !== b) : [...bs, b])

    return (
        <Layout>
            <Head>
                <title>Cheap Fuel Germany – Petrol & Diesel Prices Near You | Jon Williams</title>
                <meta name="description" content="Find the cheapest petrol station near you in Germany. Live prices for Super E5, E10 and diesel, filterable by radius, brand and opening status." />
                <meta name="theme-color" content="#f5f5f5" />
            </Head>

            <div className={`tanken view-${result ? view : 'none'}`}>
                <div className="side">
                <header className="intro">
                    <h1>Cheap fuel in Germany</h1>
                    <p>Live petrol and diesel prices – find the cheapest Tankstelle near you.</p>
                </header>

                <FuelSearch
                    value={query}
                    onChange={setQuery}
                    onSearch={(q) => search({ q }, rad, true, 'search')}
                    onLocate={locate}
                    loading={loading === 'search' || loading === 'location'}
                    disabled={!!loading}
                />

                {error && <div className="notification is-danger is-light mt-3 mb-0">{error}</div>}

                <div className="sticky">
                    <div className="seg" role="tablist" aria-label="Fuel">
                        {FUELS.map((f) => (
                            <button key={f.key} type="button" role="tab" aria-selected={fuel === f.key}
                                className={fuel === f.key ? 'on' : ''} onClick={() => setFuel(f.key)}>{f.label}</button>
                        ))}
                    </div>

                    {result && (
                        <div className="bar-row">
                            <div className="seg view-toggle" role="tablist" aria-label="View">
                                <button type="button" role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'on' : ''} onClick={() => switchView('list')}>List</button>
                                <button type="button" role="tab" aria-selected={view === 'map'} className={view === 'map' ? 'on' : ''} onClick={() => switchView('map')}>Map</button>
                            </div>
                            <button type="button" className="filters-btn" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
                                <span className="filters-label">Filters {filtersOpen ? '▴' : '▾'}</span>
                                <span className="filters-summary">{filterSummary}</span>
                            </button>
                        </div>
                    )}

                    {result && (
                        <div className={`filters ${filtersOpen ? 'open' : ''}`}>
                            <div className="filter-label">Radius</div>
                            <div className="chips">
                                {RADII.map((r) => (
                                    <button key={r} type="button" className={`chip ${rad === r ? 'on' : ''}`} onClick={() => changeRadius(r)}>{r} km</button>
                                ))}
                            </div>

                            <div className="filter-label">Sort</div>
                            <div className="seg">
                                <button type="button" className={sort === 'price' ? 'on' : ''} onClick={() => setSort('price')}>Cheapest first</button>
                                <button type="button" className={sort === 'dist' ? 'on' : ''} onClick={() => setSort('dist')}>Nearest first</button>
                            </div>

                            <label className="switch">
                                <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
                                <span>Open now only</span>
                            </label>

                            {allBrands.length > 1 && (
                                <>
                                    <div className="filter-label">
                                        Brands
                                        {brands.length > 0 && <button type="button" className="link-btn" onClick={() => setBrands([])}>Show all</button>}
                                    </div>
                                    <div className="chips wrap">
                                        {allBrands.map((b) => (
                                            <button key={b} type="button" className={`chip ${brands.includes(b) ? 'on' : ''}`} onClick={() => toggleBrand(b)}>{b}</button>
                                        ))}
                                    </div>
                                </>
                            )}

                            <button type="button" className="button is-link is-fullwidth mt-3 close-filters" onClick={() => setFiltersOpen(false)}>
                                Show {list.length} station{list.length === 1 ? '' : 's'}
                            </button>
                        </div>
                    )}
                </div>

                {!result && loading && <p className="has-text-centered has-text-grey my-6">{loading === 'location' ? 'Finding your location…' : 'Finding stations…'}</p>}

                {result?.demo && (
                    <div className="notification is-warning is-light is-size-7 py-3">
                        Demo mode: using the Tankerkönig demo key, so prices are not real.
                        Set <code>TANKERKOENIG_API_KEY</code> for live data.
                    </div>
                )}

                <div ref={panesRef} className="anchor" />

                {result && (
                        <div className="list-pane" style={{ opacity: loading ? 0.5 : 1 }}>
                            <div className="meta">
                                <span>
                                    {result.location.name ? result.location.name.split(',').slice(0, 2).join(',') : 'Your location'}
                                    {' · '}Updated {time(result.updated)}
                                </span>
                                <button type="button" className="link-btn" onClick={() => search(result.params)} disabled={!!loading} aria-label="Refresh prices">↻ Refresh</button>
                            </div>

                            {cheapest ? (
                                <div className="best-card">
                                    <div className="best-label">Cheapest {fuelLabel}</div>
                                    <div className="row">
                                        <div className="grow">
                                            <div className="brand big">{cheapest.brand}</div>
                                            <div className="addr">{cheapest.address}, {cheapest.place}</div>
                                            <div className="sub">
                                                {km(cheapest.dist)} away
                                                {avg && avg - cheapest[fuel] >= 0.005 && <> · {((avg - cheapest[fuel]) * 100).toFixed(1)} ct below avg</>}
                                            </div>
                                        </div>
                                        <Price value={cheapest[fuel]} large />
                                    </div>
                                    <div className="row mt-3">
                                        <a className="button is-success grow" href={directionsUrl(cheapest)} target="_blank" rel="noopener noreferrer">Directions</a>
                                        <button type="button" className="button is-success is-light" onClick={() => showOnMap(cheapest.id)}>Map</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="notification is-light">
                                    {result.stations.length
                                        ? 'No stations match these filters.'
                                        : 'No stations found here. Price data is only available for petrol stations in Germany.'}
                                </div>
                            )}

                            {list.length > 0 && (
                                <>
                                    <div className="meta">
                                        <span>{list.length} stations · avg €{avg.toFixed(3)} · €{Math.min(...prices).toFixed(3)}–{Math.max(...prices).toFixed(3)}</span>
                                    </div>
                                    {list.map((s) => (
                                        <div key={s.id} className={`card ${s.id === cheapest.id ? 'best' : ''}`} onClick={() => showOnMap(s.id)}
                                            role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && showOnMap(s.id)}>
                                            <div className="row">
                                                <div className="grow">
                                                    <div className="brand">
                                                        {s.brand}
                                                        {!s.isOpen && <span className="tag is-danger is-light ml-2">closed</span>}
                                                    </div>
                                                    <div className="addr">{s.address}, {s.place}</div>
                                                </div>
                                                <Price value={s[fuel]} />
                                            </div>
                                            <div className="row mt-2">
                                                <div className="grow sub">
                                                    {km(s.dist)}
                                                    {FUELS.filter((f) => f.key !== fuel && s[f.key]).map((f) => (
                                                        <span key={f.key}> · {f.short} €{s[f.key].toFixed(3)}</span>
                                                    ))}
                                                </div>
                                                <a className="button is-small is-link is-light go" href={directionsUrl(s)} target="_blank" rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}>Go ➜</a>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                )}
                </div>

                <div className="map-pane" style={{ opacity: loading ? 0.5 : 1 }}>
                    <FuelMap center={result?.location} rad={result?.rad} stations={list} fuel={fuel}
                        cheapestId={cheapest?.id} selected={selected} directionsUrl={directionsUrl} />
                </div>

                <p className="credits">
                    Price data: <a href="https://creativecommons.tankerkoenig.de" target="_blank" rel="noopener noreferrer">Tankerkönig</a> /
                    Markttransparenzstelle für Kraftstoffe (MTS-K), licensed CC BY 4.0. No guarantee of accuracy.
                    Location search: © OpenStreetMap contributors.
                </p>
            </div>

            <style jsx>{`
                .tanken {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2.5rem 0.75rem calc(1.5rem + env(safe-area-inset-bottom));
                }
                .intro h1 { font-size: 1.6rem; font-weight: 700; line-height: 1.2; color: #363636; }
                .intro p { color: #7a7a7a; font-size: 0.95rem; margin: 0.25rem 0 1rem; }


                .sticky {
                    position: sticky;
                    top: 1.5rem;
                    z-index: 20;
                    background: whitesmoke;
                    margin: 0.75rem -0.75rem 0.5rem;
                    padding: 0.5rem 0.75rem;
                    max-height: calc(100vh - 1.5rem);
                    overflow-y: auto;
                }
                .bar-row { display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: stretch; }
                .view-toggle { flex: 0 0 9.5rem; }

                .seg { display: flex; gap: 3px; padding: 3px; background: #e4e4e4; border-radius: 10px; }
                .seg button {
                    flex: 1; min-height: 2.5rem; border: 0; border-radius: 8px; background: transparent;
                    font: inherit; font-weight: 600; color: #4a4a4a; cursor: pointer;
                }
                .seg button.on { background: #fff; color: #3273dc; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); }

                .filters-btn {
                    flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
                    border: 1px solid #dbdbdb; border-radius: 10px; background: #fff; padding: 0.2rem 0.75rem; font: inherit; cursor: pointer;
                }
                .filters-label { font-weight: 600; font-size: 0.9rem; color: #363636; }
                .filters-summary { font-size: 0.75rem; color: #7a7a7a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

                .filters { background: #fff; border-radius: 10px; padding: 0.75rem; margin-top: 0.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }
                .filter-label { font-size: 0.8rem; font-weight: 600; color: #7a7a7a; text-transform: uppercase; margin: 0.75rem 0 0.4rem; display: flex; justify-content: space-between; }
                .filter-label:first-child { margin-top: 0; }
                .chips { display: flex; gap: 0.4rem; overflow-x: auto; scrollbar-width: none; }
                .chips.wrap { flex-wrap: wrap; max-height: 9rem; overflow-y: auto; }
                .chip {
                    flex: none; min-height: 2.25rem; padding: 0 0.9rem; border: 1px solid #dbdbdb; border-radius: 999px;
                    background: #fff; font: inherit; font-size: 0.9rem; color: #363636; cursor: pointer;
                }
                .chip.on { background: #3273dc; border-color: #3273dc; color: #fff; }
                .switch { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.9rem; min-height: 2.25rem; font-weight: 600; cursor: pointer; }
                .switch input { width: 1.25rem; height: 1.25rem; accent-color: #3273dc; }
                .link-btn { border: 0; background: none; padding: 0.25rem 0; color: #3273dc; font: inherit; font-size: 0.85rem; font-weight: 600; text-transform: none; cursor: pointer; }

                .anchor { scroll-margin-top: 8.5rem; }
                .list-pane, .map-pane { transition: opacity 0.15s; }
                .meta { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #7a7a7a; margin: 0.25rem 0 0.5rem; }

                .row { display: flex; align-items: center; gap: 0.75rem; }
                .grow { flex: 1; min-width: 0; }
                .brand { font-weight: 600; color: #363636; line-height: 1.3; }
                .brand.big { font-size: 1.3rem; font-weight: 700; }
                .addr { font-size: 0.85rem; color: #4a4a4a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .sub { font-size: 0.8rem; color: #7a7a7a; }

                .best-card { background: #effaf5; border: 1px solid #c8eedd; border-radius: 12px; padding: 0.9rem; margin-bottom: 0.75rem; }
                .best-card .button { height: 2.75rem; border-radius: 10px; font-weight: 600; }
                .best-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #257953; margin-bottom: 0.2rem; }

                .card {
                    background: #fff; border-radius: 10px; padding: 0.75rem 0.9rem; margin-bottom: 0.5rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08); cursor: pointer; -webkit-tap-highlight-color: transparent;
                }
                .card:active { background: #fafafa; }
                .card.best { box-shadow: inset 4px 0 0 #48c78e, 0 1px 2px rgba(0, 0, 0, 0.08); }
                .go { height: 2.25rem; border-radius: 8px; font-weight: 600; }

                .map-pane { height: calc(100vh - 10rem); height: calc(100svh - 10rem); min-height: 320px; margin-top: 0.25rem; }

                .credits { font-size: 0.75rem; color: #9a9a9a; margin-top: 2rem; }

                /* Phones and tablets: one column, list or map at a time. */
                @media (max-width: 1023px) {
                    .view-none .map-pane, .view-list .map-pane { display: none; }
                    .view-map .list-pane, .view-map .credits { display: none; }
                    .filters:not(.open) { display: none; }
                }
                @media (min-width: 769px) and (max-width: 1023px) {
                    .tanken { max-width: 720px; padding-left: 1.5rem; padding-right: 1.5rem; }
                    .sticky { margin-left: -1.5rem; margin-right: -1.5rem; padding-left: 1.5rem; padding-right: 1.5rem; }
                }
                /* Desktop: controls and list on the left, a full-height map on the right. */
                @media (min-width: 1024px) {
                    .tanken {
                        max-width: 1600px;
                        padding: 2.75rem 1.5rem 2rem;
                        display: grid;
                        grid-template-columns: minmax(380px, 460px) minmax(0, 1fr);
                        grid-template-areas: 'side map' 'credits map';
                        grid-template-rows: auto 1fr;
                        column-gap: 1.5rem;
                        align-items: start;
                    }
                    .side { grid-area: side; }
                    .credits { grid-area: credits; }
                    .map-pane {
                        grid-area: map;
                        position: sticky;
                        top: 2.75rem;
                        height: calc(100vh - 4.25rem);
                        margin-top: 0;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
                    }
                    .intro h1 { font-size: 2rem; }
                    .sticky { position: static; margin: 0.75rem 0 0.5rem; padding: 0; max-height: none; overflow: visible; }
                    .bar-row, .close-filters { display: none; }
                    .filters { margin-top: 0.75rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08); }
                }
            `}</style>
        </Layout>
    )
}

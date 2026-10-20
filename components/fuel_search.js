import { useRef } from 'react'

// One box for both searches: empty searches near the user's location, otherwise the town or postcode typed.
export default function FuelSearch({ value, onChange, onSearch, onLocate, loading, disabled }) {
    const inputRef = useRef(null)

    function submit(e) {
        e.preventDefault()
        inputRef.current?.blur() // close the mobile keyboard
        if (value.trim()) onSearch(value.trim())
        else onLocate()
    }

    return (
        <form className="search-row" onSubmit={submit} role="search">
            <input
                ref={inputRef}
                className="input"
                type="search"
                enterKeyHint="search"
                autoComplete="postal-code"
                placeholder="Search near me, or type a town / postcode"
                aria-label="Town or postcode"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <button className={`button is-link ${loading ? 'is-loading' : ''}`} type="submit" disabled={disabled}>
                {value.trim() ? 'Search' : '📍 Search'}
            </button>

            <style jsx>{`
                .search-row { display: flex; }
                .input {
                    flex: 1; min-width: 0; height: 3rem; font-size: 16px;
                    border-radius: 10px 0 0 10px; border-right: 0; box-shadow: none;
                }
                .input:focus { position: relative; z-index: 1; }
                .button { height: 3rem; border-radius: 0 10px 10px 0; font-weight: 600; padding: 0 1.1rem; }
            `}</style>
        </form>
    )
}

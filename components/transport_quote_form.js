import transportStyles from '../styles/transport.module.scss'

import { useState } from 'react'
import { CONTENT } from './transport_content'

export default function QuoteForm({ lang = 'en' }) {
    const t = CONTENT[lang].quote.form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        pickup: '',
        dropoff: '',
        bikeType: '',
        bikeInfo: '',
        notes: '',
    })


    const [status, setStatus] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        let res
        try {
            res = await fetch('/api/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, lang, website: e.target.website.value }),
            })
        } catch {
            setStatus('error')
            return
        }

        if (res.ok) {
            setStatus('success')
            setFormData({
                name: '',
                email: '',
                pickup: '',
                dropoff: '',
                bikeType: '',
                bikeInfo: '',
                notes: '',
            })
        } else {
            setStatus('error')
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`card ${transportStyles['pricing-card']} ${transportStyles['quote-card']} p-4 `}>

            {/* Honeypot: hidden from people, filled in by spam bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px' }} />

            <div className="field">
                <label className="label">{t.name} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
            </div>

            <div className="field">
                <label className="label">{t.email} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
            </div>

            <div className="field">
                <label className="label">{t.bikeType} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <div className="select is-fullwidth">
                        <select name="bikeType" value={formData.bikeType} onChange={handleChange} required>
                            <option value="">{t.bikeTypePlaceholder}</option>
                            {Object.entries(t.bikeTypes).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label">{t.bikeInfo} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input
                        className="input"
                        type="text"
                        name="bikeInfo"
                        value={formData.bikeInfo}
                        onChange={handleChange}
                        required
                    />
                </div>
                <p className="help">{t.bikeInfoHelp}</p>
            </div>


            <div className="field">
                <label className="label">{t.pickup} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="pickup" value={formData.pickup} onChange={handleChange} required />
                </div>
                <p className="help">{t.pickupHelp}</p>
            </div>

            <div className="field">
                <label className="label">{t.dropoff} <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="dropoff" value={formData.dropoff} onChange={handleChange} required />
                </div>
                <p className="help">{t.dropoffHelp}</p>
            </div>

            <div className="field">
                <label className="label">{t.notes}</label>
                <div className="control">
                    <textarea className="textarea" name="notes" value={formData.notes} onChange={handleChange}></textarea>
                </div>
                <p className="help">{t.notesHelp}</p>
            </div>

            <div className="field is-grouped is-align-items-center is-justify-content-space-between">
                {/* Left-aligned status message */}
                <div className="control">
                    {status === 'loading' && <p className="has-text-weight-bold has-text-grey">{t.sending}</p>}
                    {status === 'success' && <p className="has-text-weight-bold has-text-success">{t.success}</p>}
                    {status === 'error' && <p className="has-text-weight-bold has-text-danger">{t.error}</p>}
                </div>

                {/* Right-aligned button */}
                <div className="control">
                    <button
                        className={`button is-dark ${status === 'loading' ? 'is-loading' : ''}`}
                        type="submit"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? t.submitting : t.submit}
                    </button>
                </div>
            </div>

        </form>
    )
}

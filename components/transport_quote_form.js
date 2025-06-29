import transportStyles from '../styles/transport.module.scss'

import { useState } from 'react'

export default function QuoteForm() {
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
        const res = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })

        const result = await res.json()
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

            <div className="field">
                <label className="label">Your Name <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
            </div>

            <div className="field">
                <label className="label">Email Address <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
            </div>

            <div className="field">
                <label className="label">Bike Type</label>
                <div className="control">
                    <div className="select is-fullwidth">
                        <select name="bikeType" value={formData.bikeType} onChange={handleChange} required>
                            <option value="">Select bike type</option>
                            <option value="Small">Small (50cc–125cc)</option>
                            <option value="Medium">Medium (Standard/Naked/Touring)</option>
                            <option value="Large">Large (Adventure/Cruiser/Heavy)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="field">
                <label className="label">Bike information <span className='has-text-weight-bold is-danger'>*</span></label>
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
                <p className="help">Please enter the year, make, and model of the motorcycle, e.g. “2021 Yamaha MT-07”.</p>
            </div>


            <div className="field">
                <label className="label">Pickup Location <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="pickup" value={formData.pickup} onChange={handleChange} required />
                </div>
                <p className="help">Enter the full address or at least the city and postcode where the bike should be picked up.</p>
            </div>

            <div className="field">
                <label className="label">Drop-off Location <span className='has-text-weight-bold is-danger'>*</span></label>
                <div className="control">
                    <input className="input" type="text" name="dropoff" value={formData.dropoff} onChange={handleChange} required />
                </div>
                <p className="help">Enter the full address or city/postcode where the bike should be delivered.</p>
            </div>

            <div className="field">
                <label className="label">Notes (Optional)</label>
                <div className="control">
                    <textarea className="textarea" name="notes" value={formData.notes} onChange={handleChange}></textarea>
                </div>
                <p className="help">Add any extra details or questions – for example, if the bike doesn’t run, has accessories, requires special handling, or if the delivery is urgent or needs to happen by a specific date. Feel free to include anything else you think might be helpful.</p>
            </div>

            <div className="field is-grouped is-align-items-center is-justify-content-space-between">
                {/* Left-aligned status message */}
                <div className="control">
                    {status === 'loading' && <p className="has-text-weight-bold has-text-grey">Sending your request...</p>}
                    {status === 'success' && <p className="has-text-weight-bold has-text-success">Thank you! Your request has been sent.</p>}
                    {status === 'error' && <p className="has-text-weight-bold has-text-danger">Something went wrong. Please try again.</p>}
                </div>

                {/* Right-aligned button */}
                <div className="control">
                    <button
                        className={`button is-dark ${status === 'loading' ? 'is-loading' : ''}`}
                        type="submit"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </div>

        </form>
    )
}

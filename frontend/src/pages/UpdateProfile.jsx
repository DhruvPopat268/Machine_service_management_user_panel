import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { currentCustomer } from '../data/machines'

const ZONES = [
  'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone',
  'North-East Zone', 'North-West Zone', 'South-East Zone', 'South-West Zone',
]

export default function UpdateProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  const [form, setForm] = useState({
    name: currentCustomer.name,
    phone: currentCustomer.phone,
    email: currentCustomer.email,
    address: currentCustomer.address,
    zone: currentCustomer.zone,
    gst: currentCustomer.gstNumber,
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  if (loading) return <Spinner />

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter valid email'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.zone) e.zone = 'Please select a zone'
    if (form.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst))
      e.gst = 'Enter valid GST number'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Field = ({ label, fieldKey, props = {} }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {props.required !== false && <span className="text-red-500">*</span>}
      </label>
      <input
        value={form[fieldKey]}
        onChange={set(fieldKey)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[fieldKey] ? 'border-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {errors[fieldKey] && <p className="text-red-500 text-xs mt-1">{errors[fieldKey]}</p>}
    </div>
  )

  return (
    <Layout title="Update Profile" onBack={() => navigate(-1)}>
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {form.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{form.name}</p>
              <p className="text-xs text-gray-400">{form.zone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Field label="Full Name" fieldKey="name" props={{ type: 'text', placeholder: 'John Doe' }} />

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={set('phone')}
                  className={`flex-1 border rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <Field label="Email Address" fieldKey="email" props={{ type: 'email', placeholder: 'you@example.com' }} />

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Street, City, State, PIN"
                value={form.address}
                onChange={set('address')}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.address ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                value={form.zone}
                onChange={set('zone')}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.zone ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select your zone</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
            </div>

            {/* GST */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value.toUpperCase() })}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                  errors.gst ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.gst && <p className="text-red-500 text-xs mt-1">{errors.gst}</p>}
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </Layout>
  )
}

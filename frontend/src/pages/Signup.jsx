import { useState } from 'react'
import { Link } from 'react-router-dom'

const ZONES = [
  'North Zone',
  'South Zone',
  'East Zone',
  'West Zone',
  'Central Zone',
  'North-East Zone',
  'North-West Zone',
  'South-East Zone',
  'South-West Zone',
]

const INITIAL = {
  name: '',
  phone: '',
  email: '',
  address: '',
  zone: '',
  gst: '',
  password: '',
  confirmPassword: '',
}

export default function Signup() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

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
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    console.log('Signup:', form)
  }

  const field = (label, key, props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {props.required !== false && <span className="text-red-500">*</span>}
      </label>
      <input
        value={form[key]}
        onChange={set(key)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[key] ? 'border-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 sm:p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Register to access the customer portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          {field('Full Name', 'name', { type: 'text', placeholder: 'John Doe' })}

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

          {/* Email */}
          {field('Email Address', 'email', { type: 'email', placeholder: 'you@example.com' })}

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
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
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

          {/* Password */}
          {field('Password', 'password', { type: 'password', placeholder: 'Min. 8 characters' })}

          {/* Confirm Password */}
          {field('Confirm Password', 'confirmPassword', { type: 'password', placeholder: 'Re-enter password' })}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

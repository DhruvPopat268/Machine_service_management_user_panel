import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, fetchZones } from '../api/auth'
import AddressAutocomplete from '../components/AddressAutocomplete'

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
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [userLocation, setUserLocation] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetchZones()
      .then(setZones)
      .catch(() => setZones([]))
      .finally(() => setZonesLoading(false))
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter valid email'
    if (!form.address.trim() || !userLocation) e.address = 'Please select an address from suggestions'
    if (!form.zone) e.zone = 'Please select a zone'
    if (form.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst))
      e.gst = 'Enter valid GST number'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await signup({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        userLocation,
        zone: form.zone,
        ...(form.gst && { gstNumber: form.gst }),
      })
      navigate('/')
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
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
            <AddressAutocomplete
              value={form.address}
              onChange={(val) => { setForm((f) => ({ ...f, address: val })); setUserLocation(null); setErrors((e) => ({ ...e, address: '' })) }}
              onSelect={(loc) => { setUserLocation(loc); setForm((f) => ({ ...f, address: loc.address })); setErrors((e) => ({ ...e, address: '' })) }}
              error={errors.address}
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
              disabled={zonesLoading}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                errors.zone ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">{zonesLoading ? 'Loading zones...' : 'Select your zone'}</option>
              {zones.map((z) => (
                <option key={z._id} value={z._id}>{z.name}</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 characters"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.97 9.97 0 016.362 2.3M15 12a3 3 0 11-4.5-2.598M3 3l18 18" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Re-enter password"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.97 9.97 0 016.362 2.3M15 12a3 3 0 11-4.5-2.598M3 3l18 18" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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

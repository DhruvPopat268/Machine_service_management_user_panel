import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { fetchZones, updateProfile, sendChangeEmailOtp, verifyOtpChangeEmail } from '../api/auth'
import { useProfile } from '../context/ProfileContext'
import AddressAutocomplete from '../components/AddressAutocomplete'

function ChangeEmailModal({ currentEmail, onClose, onSuccess }) {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(newEmail)) { setEmailError('Enter a valid email address'); return }
    if (newEmail === currentEmail) { setEmailError('New email must be different from current email'); return }
    setEmailError('')
    setLoading(true)
    try {
      await sendChangeEmailOtp(newEmail)
      setStep('otp')
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (otp.join('').length < 6) { setOtpError('Please enter the complete 6-digit OTP'); return }
    setOtpError('')
    setLoading(true)
    try {
      await verifyOtpChangeEmail(otp.join(''))
      onSuccess()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">
            {step === 'email' ? 'Change Email' : 'Verify OTP'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">✕</button>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Current Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Current Email</label>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">{currentEmail}</p>
            </div>
            {/* New Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="newemail@example.com"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailError('') }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailError ? 'border-red-400' : 'border-gray-300'}`}
                autoFocus
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>
            <p className="text-xs text-gray-400">An OTP will be sent to your new email address.</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors cursor-pointer" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter the OTP sent to <span className="font-semibold text-gray-700">{newEmail}</span>
            </p>
            {/* OTP inputs */}
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-10 h-11 text-center text-lg font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${otpError ? 'border-red-400' : 'border-gray-300'}`}
                />
              ))}
            </div>
            {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              ← Change email address
            </button>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors cursor-pointer" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Update'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function UpdateProfile() {
  const navigate = useNavigate()
  const { profile, profileLoading, refreshProfile } = useProfile()

  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const photoInputRef = useRef(null)

  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview) }
  }, [photoPreview])

  useEffect(() => {
    fetchZones()
      .then(setZones)
      .catch(() => setZones([]))
      .finally(() => setZonesLoading(false))
  }, [])

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        address: profile.userLocation?.address ?? '',
        zone: profile.zone?._id ?? '',
        gst: profile.gstNumber ?? '',
      })
      setUserLocation(profile.userLocation ?? null)
    }
  }, [profile])

  if (profileLoading || !form) return <Spinner />

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number'
    if (!form.address.trim()) e.address = 'Please select an address from suggestions'
    if (!userLocation) e.address = 'Please select an address from suggestions'
    if (!form.zone) e.zone = 'Please select a zone'
    if (form.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst))
      e.gst = 'Enter valid GST number'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        userLocation,
        zone: form.zone,
        ...(form.gst && { gstNumber: form.gst }),
        ...(photoFile && { profilePhoto: photoFile }),
      })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedZoneName = zones.find((z) => z._id === form.zone)?.name ?? profile.zone?.name ?? ''

  return (
    <Layout title="Update Profile" onBack={() => navigate(-1)}>
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  : profile?.profilePhoto
                    ? <img src={profile.profilePhoto} alt={form.name} className="w-full h-full object-cover" />
                    : <span>{form.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
                }
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow cursor-pointer transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setPhotoFile(file)
                  setPhotoPreview(URL.createObjectURL(file))
                  e.target.value = ''
                }}
              />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{form.name}</p>
              <p className="text-xs text-gray-400">{selectedZoneName}</p>
              {photoFile && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="text-xs text-red-400 hover:text-red-600 mt-0.5 cursor-pointer"
                >
                  Remove new photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={set('name')}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

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
                  className={`flex-1 border rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email — disabled with Change button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="shrink-0 px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

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
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${errors.zone ? 'border-red-400' : 'border-gray-300'}`}
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
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.gst ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.gst && <p className="text-red-500 text-xs mt-1">{errors.gst}</p>}
            </div>

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">
                Profile updated successfully!
              </div>
            )}

            {apiError && (
              <p className="text-red-500 text-sm text-center">{apiError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>

      {emailModalOpen && (
        <ChangeEmailModal
          currentEmail={profile.email}
          onClose={() => setEmailModalOpen(false)}
          onSuccess={() => { setEmailModalOpen(false); refreshProfile() }}
        />
      )}
    </Layout>
  )
}

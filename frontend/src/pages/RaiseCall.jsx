import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { fetchAllOwnedMachines, fetchProblemTypes, raiseServiceCall } from '../api/machines'
import { useProfile } from '../context/ProfileContext'
import AddressAutocomplete from '../components/AddressAutocomplete'

function ChangeLocationModal({ current, onClose, onConfirm }) {
  const [draft, setDraft] = useState(current?.address ?? '')
  const [draftLocation, setDraftLocation] = useState(current ?? null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">Change Service Location</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">✕</button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Search and select the location where the engineer should visit.</p>
        <AddressAutocomplete
          value={draft}
          onChange={(val) => { setDraft(val); setDraftLocation(null) }}
          onSelect={(loc) => { setDraftLocation(loc); setDraft(loc.address) }}
        />
        {draftLocation && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Location selected
          </p>
        )}
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={!draftLocation}
            onClick={() => { onConfirm(draftLocation); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            Use This Location
          </button>
        </div>
      </div>
    </div>
  )
}

const emptyDetail = () => ({ issueDescription: '', problemTypeIds: [], photos: [] })

export default function RaiseCall() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [variants, setVariants] = useState([])
  const [problemTypes, setProblemTypes] = useState([])

  useEffect(() => {
    Promise.all([fetchAllOwnedMachines(), fetchProblemTypes()])
      .then(([machinesData, ptData]) => {
        const machines = (machinesData.machines ?? machinesData).map((machine) => ({
          key: `${machine.machineId}__${machine.serialNumber}`,
          machineId: machine.machineId,
          serialNumber: machine.serialNumber,
          machineName: machine.machineName,
          category: machine.category,
          division: machine.division,
          modelNumber: machine.modelNumber,
          isContractExpired: machine.contractType?.isContractExpired ?? false,
        }))
        setVariants(machines)
        setProblemTypes(ptData.problemTypes ?? ptData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const [callType, setCallType] = useState('')
  const [selected, setSelected] = useState({})
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [customerLocation, setCustomerLocation] = useState(null)
  const [locationModalOpen, setLocationModalOpen] = useState(false)

  useEffect(() => {
    if (profile?.userLocation) setCustomerLocation(profile.userLocation)
  }, [profile])

  if (loading) return <Spinner />

  if (error) {
    return (
      <Layout title="Raise Call" onBack={() => navigate('/calls')}>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/calls')} className="text-blue-600 hover:underline text-sm cursor-pointer">← Back to Calls</button>
        </div>
      </Layout>
    )
  }

  const selectedIds = Object.keys(selected)

  const toggleVariant = (v) => {
    setSelected((prev) => {
      if (prev[v.key]) {
        prev[v.key].photos.forEach((p) => URL.revokeObjectURL(p.preview))
        const next = { ...prev }
        delete next[v.key]
        return next
      }
      return { ...prev, [v.key]: { ...emptyDetail(), machineId: v.machineId, serialNumber: v.serialNumber } }
    })
    setErrors((prev) => { const e = { ...prev }; delete e[v.key]; return e })
  }

  const updateDetail = (key, field, value) => {
    setSelected((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
    if (field === 'issueDescription') {
      setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
    }
  }

  const handlePhotoChange = (key, e) => {
    const files = Array.from(e.target.files)
    const current = selected[key].photos
    const remaining = 5 - current.length
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    updateDetail(key, 'photos', [...current, ...toAdd])
    e.target.value = ''
  }

  const removePhoto = (key, i) => {
    const photos = selected[key].photos
    URL.revokeObjectURL(photos[i].preview)
    updateDetail(key, 'photos', photos.filter((_, idx) => idx !== i))
  }

  const validate = () => {
    const e = {}
    if (!callType) {
      e.__callType = 'Please select a call type'
      return e
    }
    if (selectedIds.length === 0) {
      e.__global = 'Please select at least one machine variant'
      return e
    }
    selectedIds.forEach((key) => {
      const desc = selected[key].issueDescription.trim()
      if (!desc) e[key] = 'Issue description is required'
      else if (desc.length < 10) e[key] = 'Description must be at least 10 characters'
    })
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)
    try {
      await raiseServiceCall(selected, customerLocation, callType)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRaiseAnother = () => {
    setSubmitted(false)
    setCallType('')
    setSelected({})
    setErrors({})
    setApiError('')
    setCustomerLocation(profile?.userLocation ?? null)
  }

  if (submitted) {
    return (
      <Layout title="Raise Call" onBack={() => navigate('/calls')}>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Call Raised Successfully!</h2>
          <p className="text-sm text-gray-500 mb-1">Your service call has been submitted.</p>
          <p className="text-sm text-gray-500 mb-8">Our team will review and assign an engineer shortly.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/calls')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              View My Calls
            </button>
            <button
              onClick={handleRaiseAnother}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Raise Another
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Raise Call" onBack={() => navigate('/calls')}>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Call Type */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Call Type</h3>
            <select
              value={callType}
              onChange={(e) => { setCallType(e.target.value); setErrors((prev) => { const er = { ...prev }; delete er.__callType; return er }) }}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                errors.__callType ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select call type</option>
              <option value="Service-Call">Service Call</option>
              <option value="Installation">Installation</option>
              <option value="Deinstallation">Deinstallation</option>
              <option value="Counter-Reading">Counter Reading</option>
              <option value="Others">Others</option>
            </select>
            {errors.__callType && <p className="text-red-500 text-xs mt-1.5">{errors.__callType}</p>}
          </section>

          {/* Step 1 — Select Variants */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Select Machine Variants
              </h3>
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div className="space-y-2">
              {variants.map((v) => {
                const isSelected = !!selected[v.key]
                return (
                  <div
                    key={v.key}
                    onClick={() => toggleVariant(v)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800 leading-tight truncate">{v.machineName}</p>
                        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          v.isContractExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {v.isContractExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Model: {v.modelNumber}</p>
                      <p className="text-xs text-gray-400">{v.category} · {v.division}</p>
                      {v.serialNumber && <p className="text-xs text-gray-400">S/N: {v.serialNumber}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            {errors.__global && (
              <p className="text-red-500 text-xs mt-3">{errors.__global}</p>
            )}
          </section>

          {/* Step 2 — Per-variant issue details */}
          {selectedIds.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
                Issue Details — {selectedIds.length} variant{selectedIds.length > 1 ? 's' : ''}
              </h3>

              {selectedIds.map((key, idx) => {
                const v = variants.find((x) => x.key === key)
                const detail = selected[key]
                const hasError = !!errors[key]

                return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                    {/* Variant header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{v.machineName}</p>
                        <p className="text-xs text-gray-400">Model: {v.modelNumber}</p>
                        {v.serialNumber && <p className="text-xs text-gray-400">S/N: {v.serialNumber}</p>}
                      </div>
                    </div>

                    {/* Problem Types (optional, multi-select dropdown) */}
                    <div className="relative" ref={openDropdown === key ? dropdownRef : null}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Problem Type <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      {/* Trigger */}
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <span className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                          {detail.problemTypeIds.length === 0 ? (
                            <span className="text-gray-400">Select problem type(s)</span>
                          ) : (
                            detail.problemTypeIds.map((id) => {
                              const pt = problemTypes.find((p) => p._id === id)
                              return pt ? (
                                <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                  {pt.name}
                                  <span
                                    role="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateDetail(key, 'problemTypeIds', detail.problemTypeIds.filter((x) => x !== id))
                                    }}
                                    className="cursor-pointer hover:text-blue-900 leading-none"
                                  >✕</span>
                                </span>
                              ) : null
                            })
                          )}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openDropdown === key ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {/* Dropdown list */}
                      {openDropdown === key && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {problemTypes.map((p) => {
                            const checked = detail.problemTypeIds.includes(p._id)
                            return (
                              <div
                                key={p._id}
                                onClick={() => {
                                  const ids = checked
                                    ? detail.problemTypeIds.filter((id) => id !== p._id)
                                    : [...detail.problemTypeIds, p._id]
                                  updateDetail(key, 'problemTypeIds', ids)
                                }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                                  checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {checked && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm text-gray-700">{p.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Issue Description (required) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the issue — when it started, what you observed, any error codes..."
                        value={detail.issueDescription}
                        onChange={(e) => updateDetail(key, 'issueDescription', e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          hasError ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {hasError
                          ? <p className="text-red-500 text-xs">{errors[key]}</p>
                          : <span />
                        }
                        <span className="text-xs text-gray-400">{detail.issueDescription.length} chars</span>
                      </div>
                    </div>

                    {/* Photos (optional, per-variant) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photos <span className="text-gray-400 font-normal">(Optional · max 5)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {detail.photos.map((p, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <img src={p.preview} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePhoto(key, i) }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer leading-none"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {detail.photos.length < 5 && (
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-[9px] text-gray-400 mt-0.5">Add</span>
                            <input
                              type="file"
                              accept="image/jpg,image/jpeg,image/png,image/webp"
                              multiple
                              className="hidden"
                              onChange={(e) => handlePhotoChange(key, e)}
                            />
                          </label>
                        )}
                      </div>
                      {detail.photos.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1.5">{detail.photos.length}/5 photos</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* Summary */}
          {selectedIds.length > 0 && (
            <section className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Summary</p>

              {/* Machines summary */}
              <div className="space-y-1">
                {selectedIds.map((key, idx) => {
                  const v = variants.find((x) => x.key === key)
                  const detail = selected[key]
                  const ptNames = detail.problemTypeIds
                    .map((id) => problemTypes.find((p) => p._id === id)?.name)
                    .filter(Boolean)
                  return (
                    <div key={key} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="font-semibold text-blue-500 shrink-0">{idx + 1}.</span>
                      <span>
                        <span className="font-semibold text-gray-800">{v.machineName}</span>
                        {' '}({v.modelNumber})
                        {v.serialNumber && <span className="text-gray-500"> · S/N: {v.serialNumber}</span>}
                        {ptNames.length > 0 && <span className="text-gray-500"> — {ptNames.join(', ')}</span>}
                        {detail.photos.length > 0 && (
                          <span className="text-gray-400"> · {detail.photos.length} photo{detail.photos.length > 1 ? 's' : ''}</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Service Location */}
              <div className="bg-white rounded-xl border border-blue-100 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">Service Location</p>
                      {customerLocation?.address
                        ? <p className="text-xs text-gray-500 leading-snug break-words">{customerLocation.address}</p>
                        : <p className="text-xs text-red-400">No location set — please add one</p>
                      }
                      <p className="text-[11px] text-blue-400 mt-1">Engineer will visit this location</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpen(true)}
                    className="shrink-0 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* API Error */}
          {apiError && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">{apiError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Raise Service Call'}
          </button>

        </form>
      </main>

      {locationModalOpen && (
        <ChangeLocationModal
          current={customerLocation}
          onClose={() => setLocationModalOpen(false)}
          onConfirm={(loc) => setCustomerLocation(loc)}
        />
      )}
    </Layout>
  )
}

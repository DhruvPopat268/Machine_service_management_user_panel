import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { ownedMachines } from '../data/machines'

const PROBLEM_TYPES = [
  'Machine Not Starting',
  'Unusual Noise / Vibration',
  'Overheating',
  'Power / Electrical Issue',
  'Hydraulic / Pneumatic Leak',
  'Software / Control Error',
  'Mechanical Breakdown',
  'Coolant System Failure',
  'Sensor / Calibration Issue',
  'Routine Maintenance Request',
  'Other',
]

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']

const PRIORITY_STYLES = {
  Low:      'border-gray-300 bg-gray-50 text-gray-600',
  Medium:   'border-yellow-400 bg-yellow-50 text-yellow-700',
  High:     'border-orange-400 bg-orange-50 text-orange-700',
  Critical: 'border-red-400 bg-red-50 text-red-600',
}

export default function RaiseCall() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])

  const [form, setForm] = useState({
    machineId: '',
    problemType: '',
    description: '',
    priority: 'Medium',
  })
  const [photos, setPhotos] = useState([]) // { file, preview }
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (loading) return <Spinner />

  const selectedMachine = ownedMachines.find((m) => m.id === form.machineId)

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    const remaining = 5 - photos.length
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos((prev) => [...prev, ...toAdd])
    e.target.value = ''
  }

  const removePhoto = (i) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const validate = () => {
    const e = {}
    if (!form.machineId) e.machineId = 'Please select a machine'
    if (!form.problemType) e.problemType = 'Please select a problem type'
    if (!form.description.trim()) e.description = 'Please describe the issue'
    else if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitted(true)
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
          <p className="text-sm text-gray-500 mb-8">Our team will assign an engineer shortly.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/calls')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              View My Calls
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm({ machineId: '', problemType: '', description: '', priority: 'Medium' }); setPhotos([]) }}
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

          {/* Select Machine */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Select Machine</h3>

            <div className="space-y-3">
              {ownedMachines.map((machine) => (
                <label
                  key={machine.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.machineId === machine.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="machine"
                    value={machine.id}
                    checked={form.machineId === machine.id}
                    onChange={() => setForm({ ...form, machineId: machine.id })}
                    className="hidden"
                  />
                  <img
                    src={machine.images[0]}
                    alt={machine.machineName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{machine.machineName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {machine.variants.map((v, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          Variant: <span className="font-medium text-gray-700">{v.name} — {v.value}</span>
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{machine.modelNumber} · {machine.category}</p>
                    <p className="text-xs text-gray-400">{machine.serialNumber}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    form.machineId === machine.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {form.machineId === machine.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              ))}
            </div>
            {errors.machineId && <p className="text-red-500 text-xs mt-2">{errors.machineId}</p>}
          </section>

          {/* Problem Type & Priority */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Issue Details</h3>

            {/* Problem Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.problemType}
                onChange={(e) => setForm({ ...form, problemType: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.problemType ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select problem type</option>
                {PROBLEM_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.problemType && <p className="text-red-500 text-xs mt-1">{errors.problemType}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ${
                      form.priority === p
                        ? PRIORITY_STYLES[p]
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue in detail — when it started, what you observed, any error codes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description
                  ? <p className="text-red-500 text-xs">{errors.description}</p>
                  : <span />
                }
                <span className="text-xs text-gray-400">{form.description.length} chars</span>
              </div>
            </div>
          </section>

          {/* Photo Upload */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
              Upload Photos <span className="text-gray-300 font-normal normal-case">(Optional · max 5)</span>
            </h3>

            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={p.preview} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs cursor-pointer leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] text-gray-400 mt-1">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">{photos.length}/5 photos added</p>
          </section>

          {/* Summary preview if machine selected */}
          {selectedMachine && (
            <section className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2">Call Summary</p>
              <p className="text-sm font-semibold text-gray-800">{selectedMachine.machineName}</p>
              <p className="text-xs text-gray-500">{selectedMachine.serialNumber}</p>
              {form.problemType && <p className="text-xs text-gray-600 mt-1">Issue: {form.problemType}</p>}
              <p className="text-xs text-gray-600">Priority: <span className="font-semibold">{form.priority}</span></p>
            </section>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm cursor-pointer"
          >
            Raise Call
          </button>

        </form>
      </main>
    </Layout>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchMachineDetail } from '../api/machines'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const Row = ({ label, value }) => (
  <div className="flex flex-row justify-between items-start py-2.5 border-b border-gray-100 last:border-0 gap-4">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <span className="text-xs font-medium text-gray-800 text-right break-words">{value ?? '—'}</span>
  </div>
)

export default function MachineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetchMachineDetail(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Machine not found.'}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm cursor-pointer">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  const { machine, customerInfo, createdAt } = data
  const contract = machine?.contractType
  const images = machine?.images ?? []
  const total = images.length

  return (
    <Layout title="Machine Detail" onBack={() => navigate(-1)}>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Machine Name Heading */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{machine.machineName}</h2>
            <p className="text-sm text-gray-400 mt-1">{machine.modelNumber}</p>
          </div>
          {contract?.isContractExpired && (
            <span className="shrink-0 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Expired</span>
          )}
        </div>

        {/* Image Gallery */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">Images</h3>
          {total > 0 ? (
            <div className="relative">
              <img
                src={images[activeImg]}
                alt={`${machine.machineName} ${activeImg + 1}`}
                className="w-full h-64 object-cover rounded-xl"
              />
              {total > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((p) => (p - 1 + total) % total)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg((p) => (p + 1) % total)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
              {total > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === activeImg ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" /></svg>
            </div>
          )}
          {total > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-24 object-cover rounded-lg shrink-0 cursor-pointer transition-all ${i === activeImg ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Machine Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Machine Information</h3>
          <Row label="Machine Name" value={machine.machineName} />
          <Row label="Serial Number" value={machine.serialNumber} />
          <Row label="Model Number" value={machine.modelNumber} />
          <Row label="Category" value={machine.category} />
          <Row label="Division" value={machine.division} />
          <Row label="Purchased On" value={fmt(createdAt)} />
        </section>

        {/* Service Contract */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Service Contract</h3>
          <Row label="Contract Name" value={contract?.name} />
          <Row label="Contract Code" value={contract?.code} />
          <Row label="Free Service" value={contract?.freeService ? 'Included' : 'Not Included'} />
          <Row label="Free Parts" value={contract?.freeParts ? 'Included' : 'Not Included'} />
          <Row label="Valid From" value={fmt(contract?.validFrom)} />
          <Row label="Valid To" value={fmt(contract?.validTo)} />
        </section>

        {/* Customer Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Customer Information</h3>
          <Row label="Name" value={customerInfo?.name} />
          <Row label="Phone" value={customerInfo?.phone ? `+91 ${customerInfo.phone}` : null} />
          <Row label="Email" value={customerInfo?.email} />
          <Row label="Address" value={customerInfo?.address} />
          <Row label="Zone" value={customerInfo?.zone} />
          <Row label="GST Number" value={customerInfo?.gstNumber} />
        </section>

      </main>
    </Layout>
  )
}

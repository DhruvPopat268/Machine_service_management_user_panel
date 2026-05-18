import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ownedMachines, currentCustomer } from '../data/machines'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2.5 border-b border-gray-100 last:border-0 gap-0.5 sm:gap-4">
    <span className="text-xs font-semibold text-gray-400 sm:text-sm sm:font-normal sm:text-gray-500 sm:w-40 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 sm:text-right break-words">{value ?? '—'}</span>
  </div>
)

export default function MachineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const machine = ownedMachines.find((m) => m.id === id)
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  if (loading) return <Spinner />

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Machine not found.</p>
          <button onClick={() => navigate('/machines')} className="text-blue-600 hover:underline text-sm cursor-pointer">
            ← Back to My Machines
          </button>
        </div>
      </div>
    )
  }

  const firstVariant = machine.variants[0]
  const contract = firstVariant?.contractType
  const total = machine.images.length

  return (
    <Layout title="Machine Detail" onBack={() => navigate('/machines')}>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Machine Name Heading */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{machine.machineName}</h2>
          <p className="text-sm text-gray-400 mt-1">{machine.modelNumber}</p>
        </div>

        {/* Machine Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Machine Information</h3>
          <Row label="Machine Name" value={machine.machineName} />
          <Row label="Model Number" value={machine.modelNumber} />
          <Row label="Serial Number" value={machine.serialNumber} />
          <Row label="HSN Code" value={machine.hsnCode} />
          <Row label="Part Code" value={machine.partCode} />
          <Row label="GST %" value={`${machine.gstPercentage}%`} />
          <Row label="Category" value={machine.category} />
          <Row label="Division" value={machine.division} />
          <Row label="Status" value={machine.status} />
          <Row label="Purchased On" value={fmt(machine.purchasedAt)} />
          {machine.notes && <Row label="Notes" value={machine.notes} />}
        </section>

        {/* Variants & Pricing */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">Variants & Pricing</h3>
          <div className="space-y-4">
            {machine.variants.map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-800">{v.name}</span>
                  <span className="text-sm font-semibold text-blue-600">{v.value}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <Row label="Quantity" value={`${v.quantity} unit(s)`} />
                  <Row label="Unit Price" value={fmtCurrency(v.price)} />
                  {v.discountedPrice && <Row label="Discounted Price" value={fmtCurrency(v.discountedPrice)} />}
                  <Row label="Line Total" value={fmtCurrency(v.total)} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-700">Grand Total</span>
            <span className="text-lg font-bold text-blue-600">{fmtCurrency(machine.grandTotal)}</span>
          </div>
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
          <Row label="Name" value={currentCustomer.name} />
          <Row label="Phone" value={`+91 ${currentCustomer.phone}`} />
          <Row label="Email" value={currentCustomer.email} />
          <Row label="Address" value={currentCustomer.address} />
          <Row label="Zone" value={currentCustomer.zone} />
          <Row label="GST Number" value={currentCustomer.gstNumber} />
        </section>

        {/* Image Gallery */}
        {machine.images.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">Images</h3>
            <div className="relative">
              <img
                src={machine.images[activeImg]}
                alt={`${machine.machineName} ${activeImg + 1}`}
                className="w-full h-64 object-cover rounded-xl"
              />

              {/* Arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((prev) => (prev - 1 + total) % total)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg((prev) => (prev + 1) % total)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 cursor-pointer transition-colors"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Dots */}
              {total > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {machine.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                        i === activeImg ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {total > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {machine.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb ${i + 1}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-lg shrink-0 cursor-pointer transition-all ${
                      i === activeImg ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </Layout>
  )
}

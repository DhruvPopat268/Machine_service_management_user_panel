import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { fetchCallDetail } from '../api/machines'

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2.5 border-b border-gray-100 last:border-0 gap-0.5 sm:gap-4">
    <span className="text-xs font-semibold text-gray-400 sm:text-sm sm:font-normal sm:text-gray-500 sm:w-44 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800 sm:text-right break-words">{value ?? '—'}</span>
  </div>
)

const STATUS_STYLES = {
  'Open':        'bg-blue-50 text-blue-600',
  'Assigned':    'bg-purple-50 text-purple-600',
  'In Progress': 'bg-yellow-50 text-yellow-600',
  'On Hold':     'bg-orange-50 text-orange-600',
  'Completed':   'bg-green-50 text-green-600',
  'Cancelled':   'bg-red-50 text-red-500',
}

const PRIORITY_STYLES = {
  'Critical': 'bg-red-100 text-red-600',
  'High':     'bg-orange-100 text-orange-600',
  'Medium':   'bg-yellow-100 text-yellow-600',
  'Low':      'bg-gray-100 text-gray-500',
}

export default function CallDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [call, setCall] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCallDetail(id)
      .then(setCall)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  if (error || !call) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Call not found.'}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm cursor-pointer">
            ← Back
          </button>
        </div>
      </div>
    )
  }

  const { callId, status, priority, callType, createdBy, machines, engineerInfo, customerInfo, dates, totalServiceCharges, totalPartsCharges, totalCharges, onHoldReason } = call

  return (
    <Layout title="Call Detail" onBack={() => navigate(-1)}>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Heading */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-xs text-gray-400 mb-1">{callId}</p>
              <h2 className="text-xl font-bold text-gray-800 leading-snug">
                {machines?.[0]?.machineName ?? 'Service Call'}
                {machines?.length > 1 && (
                  <span className="text-base font-normal text-gray-400"> +{machines.length - 1} more</span>
                )}
              </h2>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${STATUS_STYLES[status]}`}>
              {status}
            </span>
          </div>
          {priority && (
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-2 ${PRIORITY_STYLES[priority]}`}>
              {priority} Priority
            </span>
          )}
        </div>

        {/* Call Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Call Information</h3>
          <Row label="Call ID" value={callId} />
          <Row label="Status" value={status} />
          <Row label="Priority" value={priority ?? 'Not set yet'} />
          <Row label="Call Type" value={callType} />
          <Row label="Created By" value={createdBy} />
          <Row label="Raised On" value={dates?.created ? fmtDateTime(dates.created) : null} />
          {dates?.assigned && <Row label="Assigned On" value={fmtDateTime(dates.assigned)} />}
          {dates?.travelStarted && <Row label="Travel Started" value={fmtDateTime(dates.travelStarted)} />}
          {dates?.reachedLocation && <Row label="Reached Location" value={fmtDateTime(dates.reachedLocation)} />}
          {dates?.inProgress && <Row label="In Progress On" value={fmtDateTime(dates.inProgress)} />}
          {dates?.onHold && <Row label="On Hold On" value={fmtDateTime(dates.onHold)} />}
          {dates?.completed && <Row label="Completed On" value={fmtDateTime(dates.completed)} />}
          {dates?.cancelled && <Row label="Cancelled On" value={fmtDateTime(dates.cancelled)} />}
          {onHoldReason && <Row label="On Hold Reason" value={onHoldReason} />}
        </section>

        {/* Machines */}
        {machines?.map((m, i) => (
          <section key={m.serialNumber ?? i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
              Machine {machines.length > 1 ? `#${i + 1}` : 'Information'}
            </h3>
            <Row label="Machine Name" value={m.machineName} />
            <Row label="Serial Number" value={m.serialNumber} />
            <Row label="Model Number" value={m.modelNumber} />
            <Row label="Category" value={m.category} />
            <Row label="Division" value={m.division} />
            <Row label="Contract" value={m.contractType?.name} />
            <Row label="Contract Code" value={m.contractType?.code} />
            <Row label="Free Service" value={m.contractType?.freeService ? 'Included' : 'Not Included'} />
            <Row label="Free Parts" value={m.contractType?.freeParts ? 'Included' : 'Not Included'} />
            {m.contractType?.validFrom && <Row label="Contract Valid From" value={fmt(m.contractType.validFrom)} />}
            {m.contractType?.validTo && <Row label="Contract Valid To" value={fmt(m.contractType.validTo)} />}
            <Row label="Problem Type" value={m.problemTypes?.length > 0 ? m.problemTypes.join(', ') : null} />
            {m.serviceCharge > 0 && <Row label="Service Charge" value={`₹${m.serviceCharge}`} />}

            {/* Issue Description */}
            {m.issueDescription && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 mb-1">Issue Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{m.issueDescription}</p>
              </div>
            )}

            {/* Parts Added */}
            {m.usedParts?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 mb-2">Parts Added</p>
                <div className="space-y-2">
                  {m.usedParts.map((part, idx) => (
                    <div key={idx} className="flex justify-between items-start border border-gray-100 rounded-xl p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-800">{part.machineName}</span>
                        <span className="text-xs text-gray-400">Part Code: {part.partCode} · {part.category}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 text-xs text-gray-500 shrink-0 ml-3">
                        <span className="text-gray-400 line-through">₹{part.sellingPrice}</span>
                        <span>₹{part.discountedSellingPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {m.partsCharge > 0 && <p className="text-xs font-semibold text-green-600 mt-2 text-right">Parts Charge: ₹{m.partsCharge}</p>}
              </div>
            )}

            {/* Images */}
            {m.images?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 mb-2">Images</p>
                <div className="flex flex-wrap gap-2">
                  {m.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt={`img ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover border border-gray-100 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Charges Summary */}
        {(totalServiceCharges != null || totalPartsCharges > 0 || totalCharges > 0) && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Charges Summary</h3>
            <Row label="Total Service Charges" value={`₹${totalServiceCharges ?? 0}`} />
            {totalPartsCharges > 0 && <Row label="Total Parts Charges" value={`₹${totalPartsCharges}`} />}
            {totalCharges > 0 && <Row label="Total Charges" value={`₹${totalCharges}`} />}
          </section>
        )}

        {/* Customer Info */}
        {customerInfo && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Customer Information</h3>
            <Row label="Name" value={customerInfo.name} />
            <Row label="Phone" value={customerInfo.phone} />
            <Row label="Email" value={customerInfo.email} />
            {customerInfo.zone && <Row label="Zone" value={customerInfo.zone} />}
            {customerInfo.gstNumber && <Row label="GST Number" value={customerInfo.gstNumber} />}
            <Row label="Address" value={customerInfo.location?.address ?? customerInfo.address} />
          </section>
        )}

        {/* Engineer Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Assigned Engineer</h3>
          {engineerInfo?.name ? (
            <>
              {engineerInfo.identityId && <Row label="Engineer ID" value={engineerInfo.identityId} />}
              <Row label="Name" value={engineerInfo.name} />
              {engineerInfo.phone && <Row label="Phone" value={engineerInfo.phone} />}
              {engineerInfo.email && <Row label="Email" value={engineerInfo.email} />}
            </>
          ) : (
            <p className="text-sm text-gray-400">No engineer assigned yet.</p>
          )}
        </section>


      </main>
    </Layout>
  )
}

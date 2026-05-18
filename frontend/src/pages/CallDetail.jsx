import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { calls } from '../data/calls'

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

const AUDIT_DOT = {
  'Open':        'bg-blue-500',
  'Assigned':    'bg-purple-500',
  'In Progress': 'bg-yellow-500',
  'On Hold':     'bg-orange-500',
  'Completed':   'bg-green-500',
  'Cancelled':   'bg-red-500',
}

export default function CallDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const call = calls.find((c) => c.id === id)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  if (loading) return <Spinner />

  if (!call) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Call not found.</p>
          <button onClick={() => navigate('/calls')} className="text-blue-600 hover:underline text-sm cursor-pointer">
            ← Back to Calls
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout title="Call Detail" onBack={() => navigate('/calls')}>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Heading */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-800 leading-snug">{call.issueTitle}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${STATUS_STYLES[call.status]}`}>
              {call.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">{call.ticketNumber}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[call.priority]}`}>
              {call.priority} Priority
            </span>
          </div>
        </div>

        {/* Issue Description */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Issue Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{call.issueDescription}</p>
        </section>

        {/* Call Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Call Information</h3>
          <Row label="Ticket Number" value={call.ticketNumber} />
          <Row label="Status" value={call.status} />
          <Row label="Priority" value={call.priority} />
          <Row label="Contract Type" value={call.contractType} />
          <Row label="Contract Code" value={call.contractCode} />
          <Row label="Raised On" value={fmtDateTime(call.raisedAt)} />
          <Row label="Assigned On" value={call.assignedAt ? fmtDateTime(call.assignedAt) : null} />
          <Row label="Expected Resolution" value={call.expectedResolutionDate ? fmt(call.expectedResolutionDate) : null} />
          {call.resolvedAt && <Row label="Resolved On" value={fmtDateTime(call.resolvedAt)} />}
          {call.cancelledAt && <Row label="Cancelled On" value={fmtDateTime(call.cancelledAt)} />}
          {call.cancellationReason && <Row label="Cancellation Reason" value={call.cancellationReason} />}
        </section>

        {/* Machine Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Machine Information</h3>
          <Row label="Machine Name" value={call.machineName} />
          <Row label="Model Number" value={call.modelNumber} />
          <Row label="Serial Number" value={call.serialNumber} />
          <Row label="Category" value={call.category} />
          <Row label="Division" value={call.division} />
        </section>

        {/* Engineer Info */}
        {call.engineer ? (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Assigned Engineer</h3>
            <Row label="Name" value={call.engineer.name} />
            <Row label="Phone" value={`+91 ${call.engineer.phone}`} />
            <Row label="Email" value={call.engineer.email} />
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Assigned Engineer</h3>
            <p className="text-sm text-gray-400">No engineer assigned yet.</p>
          </section>
        )}

        {/* Resolution Notes */}
        {call.resolutionNotes && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Resolution Notes</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{call.resolutionNotes}</p>
          </section>
        )}

        {/* Parts Used */}
        {call.partsUsed.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Parts Used</h3>
            <div className="space-y-0">
              {call.partsUsed.map((part, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{part.partName}</p>
                    <p className="text-xs text-gray-400">{part.partCode}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Qty: {part.quantity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audit Trail */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">Audit Trail</h3>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-5">
              {call.auditTrail.map((entry, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 z-10 ${AUDIT_DOT[entry.status]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${STATUS_STYLES[entry.status]}`}>
                        {entry.status}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDateTime(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.note}</p>
                    <p className="text-xs text-gray-400 mt-0.5">by {entry.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </Layout>
  )
}

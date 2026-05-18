import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { ownedMachines } from '../data/machines'
import { calls } from '../data/calls'

const ACTIVE_STATUSES = ['Open', 'Assigned', 'In Progress', 'On Hold']

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_STYLES = {
  'Open':        'bg-blue-50 text-blue-600',
  'Assigned':    'bg-purple-50 text-purple-600',
  'In Progress': 'bg-yellow-50 text-yellow-600',
  'On Hold':     'bg-orange-50 text-orange-600',
}

const PRIORITY_STYLES = {
  'Critical': 'bg-red-100 text-red-600',
  'High':     'bg-orange-100 text-orange-600',
  'Medium':   'bg-yellow-100 text-yellow-600',
  'Low':      'bg-gray-100 text-gray-500',
}

// derive stats
const now = new Date()
const totalMachines = ownedMachines.length
const totalRaisedCalls = calls.length
const totalCompletedCalls = calls.filter((c) => c.status === 'Completed').length
const activeCalls = calls.filter((c) => ACTIVE_STATUSES.includes(c.status))

// expired: any variant whose contract validTo is in the past
const expiredMachines = ownedMachines.filter((m) =>
  m.variants.some((v) => new Date(v.contractType.validTo) < now)
)

const STAT_CARDS = [
  {
    label: 'Total Owned Machines',
    value: totalMachines,
    bg: 'bg-blue-50',
    valueColor: 'text-blue-600',
    labelColor: 'text-blue-400',
  },
  {
    label: 'Total Raised Calls',
    value: totalRaisedCalls,
    bg: 'bg-orange-50',
    valueColor: 'text-orange-500',
    labelColor: 'text-orange-400',
  },
  {
    label: 'Completed Calls',
    value: totalCompletedCalls,
    bg: 'bg-green-50',
    valueColor: 'text-green-600',
    labelColor: 'text-green-400',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  if (loading) return <Spinner />

  return (
    <Layout title="Home">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {STAT_CARDS.map(({ label, value, bg, valueColor, labelColor }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 sm:p-4 flex flex-col gap-1`}>
              <span className={`text-xl sm:text-2xl font-bold ${valueColor}`}>{value}</span>
              <span className={`text-[11px] sm:text-xs font-medium ${labelColor} leading-tight`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Expired Contracts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Expired Contracts Machines</h2>
            <span className="text-xs text-gray-400">{expiredMachines.length} machine(s)</span>
          </div>

          {expiredMachines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              No expired contracts
            </div>
          ) : (
            <div className="space-y-3">
              {expiredMachines.map((machine) => {
                const expiredVariants = machine.variants.filter(
                  (v) => new Date(v.contractType.validTo) < now
                )
                const contract = expiredVariants[0]?.contractType
                return (
                  <div
                    key={machine.id}
                    onClick={() => navigate(`/machines/${machine.id}`)}
                    className="bg-white rounded-2xl border border-red-100 p-4 cursor-pointer hover:shadow-md hover:border-red-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{machine.machineName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{machine.modelNumber} · {machine.category}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-500 shrink-0">
                        Expired
                      </span>
                    </div>
                    {contract && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500">
                        <span>{contract.name} ({contract.code})</span>
                        <span className="text-red-400 font-medium">Expired: {fmt(contract.validTo)}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Active Calls */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Active Calls</h2>
            <button
              onClick={() => navigate('/calls', { state: { defaultTab: 'Active' } })}
              className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {activeCalls.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              No active calls
            </div>
          ) : (
            <div className="space-y-3">
              {activeCalls.slice(0, 3).map((call) => (
                <div
                  key={call.id}
                  onClick={() => navigate(`/calls/${call.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{call.ticketNumber}</p>
                      <p className="text-sm font-bold text-gray-800 leading-snug">{call.issueTitle}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[call.status]}`}>
                      {call.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{call.machineName} · {call.modelNumber}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[call.priority]}`}>
                      {call.priority} Priority
                    </span>
                    <span className="text-xs text-gray-400">{fmt(call.raisedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </Layout>
  )
}

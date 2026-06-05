import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { fetchDashboard } from '../api/machines'

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

export default function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  if (error) {
    return (
      <Layout title="Home">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Layout>
    )
  }

  const { stats, expiredContractMachines, activeCalls } = data

  const STAT_CARDS = [
    { label: 'Total Owned Machines',    value: stats.totalOwnedMachines,      bg: 'bg-blue-50',   valueColor: 'text-blue-600',   labelColor: 'text-blue-400'   },
    { label: 'Expired Contracts',       value: stats.expiredContractMachines, bg: 'bg-red-50',    valueColor: 'text-red-500',    labelColor: 'text-red-400'    },
    { label: 'Total Raised Calls',      value: stats.totalRaisedCalls,        bg: 'bg-orange-50', valueColor: 'text-orange-500', labelColor: 'text-orange-400' },
    { label: 'Completed Calls',         value: stats.totalCompletedCalls,     bg: 'bg-green-50',  valueColor: 'text-green-600',  labelColor: 'text-green-400'  },
  ]

  return (
    <Layout title="Home">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
            <span className="text-xs text-gray-400">{stats.expiredContractMachines} machine(s)</span>
          </div>

          {expiredContractMachines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
              No expired contracts
            </div>
          ) : (
            <div className="space-y-3">
              {expiredContractMachines.map((machine) => (
                  <div
                    key={machine.serialNumber}
                    onClick={() => navigate(`/machines/${machine.serialNumber}`)}
                    className="bg-white rounded-2xl border border-red-100 p-4 cursor-pointer hover:shadow-md hover:border-red-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{machine.machineName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{machine.modelNumber} · {machine.category} · S/N: {machine.serialNumber}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-500 shrink-0">
                        Expired
                      </span>
                    </div>
                    {machine.contractType && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500">
                        <span>{machine.contractType.name} ({machine.contractType.code})</span>
                        <span className="text-red-400 font-medium">Expired: {fmt(machine.contractType.validTo)}</span>
                      </div>
                    )}
                  </div>
              ))}
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
              {activeCalls.map((call) => (
                <div
                  key={call._id}
                  onClick={() => navigate(`/calls/${call._id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{call.callId}</p>
                      <p className="text-sm font-bold text-gray-800 leading-snug">
                        {call.machines?.[0]?.machineName ?? 'Service Call'}
                        {call.machines?.length > 1 && (
                          <span className="text-xs font-normal text-gray-400"> +{call.machines.length - 1} more</span>
                        )}
                      </p>
                      {call.machines?.[0]?.serialNumber && (
                        <p className="text-xs text-gray-400 mt-0.5">S/N: {call.machines[0].serialNumber}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[call.status]}`}>
                      {call.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {call.machines?.[0]?.category} · {call.machines?.[0]?.division}
                  </p>
                  <div className="flex items-center justify-between">
                    {call.priority && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[call.priority]}`}>
                        {call.priority} Priority
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{fmt(call.dates?.created)}</span>
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

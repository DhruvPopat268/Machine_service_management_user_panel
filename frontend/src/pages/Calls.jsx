import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { fetchActiveCalls, fetchCompletedCalls, fetchCancelledCalls } from '../api/machines'

const TABS = ['Active', 'Completed', 'Cancelled']

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const STATUS_STYLES = {
  'Open':        'bg-blue-50 text-blue-600',
  'Assigned':    'bg-purple-50 text-purple-600',
  'In Progress': 'bg-yellow-50 text-yellow-600',
  'On Hold':     'bg-orange-50 text-orange-600',
  'Completed':   'bg-green-50 text-green-600',
  'Cancelled':   'bg-red-50 text-red-500',
}

const STATUS_BORDER = {
  'Open':        'border-l-blue-400',
  'Assigned':    'border-l-purple-400',
  'In Progress': 'border-l-yellow-400',
  'On Hold':     'border-l-orange-400',
  'Completed':   'border-l-green-400',
  'Cancelled':   'border-l-red-400',
}

const PRIORITY_STYLES = {
  'Critical': 'bg-red-100 text-red-600',
  'High':     'bg-orange-100 text-orange-600',
  'Medium':   'bg-yellow-100 text-yellow-600',
  'Low':      'bg-gray-100 text-gray-500',
}

const FETCHERS = {
  Active:    fetchActiveCalls,
  Completed: fetchCompletedCalls,
  Cancelled: fetchCancelledCalls,
}

export default function Calls() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab ?? 'Active')
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    FETCHERS[activeTab]()
      .then(setCalls)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <Layout title="My Calls">
      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Raise Call Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/raise-call')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            + Raise Call
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{calls.length} call(s) found</p>

            {calls.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No {activeTab.toLowerCase()} calls</div>
            ) : (
              <div className="space-y-3">
                {calls.map((call) => {
                  const createdAt = call.dates?.created
                  const completedAt = call.dates?.completed
                  const cancelledAt = call.dates?.cancelled

                  return (
                    <div
                      key={call._id}
                      onClick={() => navigate(`/calls/${call._id}`)}
                      className={`bg-white rounded-2xl border border-gray-100 border-l-4 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all ${STATUS_BORDER[call.status] ?? 'border-l-gray-300'}`}
                    >
                      {/* Header row — Call ID + status + date */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{call.callId}</p>
                          {call.priority && (
                            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[call.priority]}`}>
                              {call.priority} Priority
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[call.status]}`}>
                            {call.status}
                          </span>
                        </div>
                      </div>

                      {/* Machines */}
                      <div className="space-y-3 mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          Machines ({call.machines?.length ?? 0})
                        </p>
                        {call.machines?.map((m, i) => (
                          <div key={m.serialNumber ?? i} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                            <p className="text-sm font-bold text-gray-800">{m.machineName}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <p className="text-xs"><span className="text-gray-400">S/N :</span> <span className="font-medium text-gray-700">{m.serialNumber}</span></p>
                              <p className="text-xs"><span className="text-gray-400">Model No :</span> <span className="font-medium text-gray-700">{m.modelNumber}</span></p>
                              <p className="text-xs"><span className="text-gray-400">Category :</span> <span className="font-medium text-gray-700">{m.category}</span></p>
                              <p className="text-xs"><span className="text-gray-400">Division :</span> <span className="font-medium text-gray-700">{m.division}</span></p>
                            </div>
                            {m.problemTypes?.length > 0 && (
                              <p className="text-xs"><span className="text-gray-400">Problem :</span> <span className="font-medium text-gray-700">{m.problemTypes.join(', ')}</span></p>
                            )}
                            {m.issueDescription && (
                              <p className="text-xs pt-1 border-t border-gray-200"><span className="text-gray-400">Description :</span> <span className="font-medium text-gray-700">{m.issueDescription}</span></p>
                            )}
                            {m.images?.length > 0 && (
                              <div className="pt-1 border-t border-gray-200">
                                <p className="text-xs text-gray-400 mb-1.5">Attachments :</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.images.map((img, idx) => (
                                    <a key={idx} href={img} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                      <img src={img} alt={`img ${idx + 1}`} className="w-12 h-12 rounded-lg object-cover border border-gray-200 hover:opacity-80 transition-opacity" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer — engineer + resolved/cancelled date */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${call.engineerInfo?.name ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-xs text-gray-500">
                            {call.engineerInfo?.name
                              ? <span className="font-medium text-gray-700">{call.engineerInfo.name}</span>
                              : 'Engineer not assigned'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {completedAt && (
                            <span className="text-xs text-green-500 font-medium">Completed: {fmt(completedAt)}</span>
                          )}
                          {cancelledAt && (
                            <span className="text-xs text-red-400 font-medium">Cancelled: {fmt(cancelledAt)}</span>
                          )}
                          {createdAt && (
                            <span className="text-[11px] text-gray-400">{fmt(createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  )
}

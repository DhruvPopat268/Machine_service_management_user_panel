import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { calls } from '../data/calls'

const ACTIVE_STATUSES = ['Open', 'Assigned', 'In Progress', 'On Hold']

const TABS = ['Active', 'Completed', 'Cancelled']

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

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

export default function Calls() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab ?? 'Active')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  if (loading) return <Spinner />

  const filtered = calls.filter((c) => {
    if (activeTab === 'Active') return ACTIVE_STATUSES.includes(c.status)
    if (activeTab === 'Completed') return c.status === 'Completed'
    return c.status === 'Cancelled'
  })

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
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-4">{filtered.length} call(s) found</p>

        {/* Call Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No {activeTab.toLowerCase()} calls</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((call) => (
              <div
                key={call.id}
                onClick={() => navigate(`/calls/${call.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">{call.ticketNumber}</p>
                    <h3 className="text-sm font-bold text-gray-800 leading-snug">{call.issueTitle}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[call.status]}`}>
                    {call.status}
                  </span>
                </div>

                {/* Machine */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs text-gray-500">{call.machineName}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-400">{call.modelNumber}</span>
                </div>

                {/* Priority + Contract */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[call.priority]}`}>
                    {call.priority} Priority
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    {call.contractCode}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap justify-between items-center gap-1 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span>Raised: {fmt(call.raisedAt)} {fmtTime(call.raisedAt)}</span>
                  {call.engineer && (
                    <span className="text-gray-500 font-medium">{call.engineer.name}</span>
                  )}
                  {call.resolvedAt && (
                    <span className="text-green-500 font-medium">Resolved: {fmt(call.resolvedAt)}</span>
                  )}
                  {call.cancelledAt && !call.resolvedAt && (
                    <span className="text-red-400 font-medium">Cancelled: {fmt(call.cancelledAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  )
}

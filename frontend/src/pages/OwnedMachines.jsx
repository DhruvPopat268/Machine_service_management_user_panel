import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchOwnedMachines } from '../api/machines'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { useProfile } from '../context/ProfileContext'

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function OwnedMachines() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [machines, setMachines] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchOwnedMachines(page, 10)
      .then((data) => {
        setMachines(data.machines)
        setPagination(data.pagination)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <Spinner />

  return (
    <Layout title="My Machines" subtitle={profile?.name ? `Welcome, ${profile.name}` : undefined}>
      <main className="max-w-6xl mx-auto px-3 py-5 sm:px-4 sm:py-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!error && (
          <p className="text-sm text-gray-500 mb-4 sm:mb-6">{pagination.total} machine(s) registered to your account</p>
        )}

        {machines.length === 0 && !error ? (
          <div className="text-center py-20 text-gray-400 text-sm">No machines found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {machines.map((item) => {
              const { variant } = item
              const contract = variant?.contractType

              return (
                <div
                  key={variant._id}
                  onClick={() => navigate(`/machines/${variant._id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                >
                  {/* Machine Image */}
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.machineName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" /></svg>
                      </div>
                    )}
                  </div>
                  {/* Card Body */}
                  <div className="p-4 sm:p-5">
                    {/* Name & Meta */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">{item.machineName}</h2>
                        {contract?.isContractExpired && (
                          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Expired</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Model: {item.modelNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Category: {item.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Division: {item.division}</p>
                    </div>

                    {/* Variant Info */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{variant.name}</span>
                        <span className="font-semibold text-gray-700">{variant.value}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Quantity</span>
                        <span className="font-semibold text-gray-700">{variant.quantity} unit(s)</span>
                      </div>
                    </div>

                    {/* Contract Info */}
                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 shrink-0">Contract</span>
                        <span className="font-medium text-gray-700 text-right">{contract?.name}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 shrink-0">Valid From</span>
                        <span className="font-medium text-gray-700">{fmt(contract?.validFrom)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 shrink-0">Valid To</span>
                        <span className="font-medium text-gray-700">{fmt(contract?.validTo)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <p className="text-xs text-gray-400">Purchased At <span className="font-semibold text-gray-700">{fmt(item.createdAt)}</span></p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        )}

      </main>
    </Layout>
  )
}

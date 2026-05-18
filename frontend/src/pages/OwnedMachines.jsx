import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ownedMachines, currentCustomer } from '../data/machines'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const fmt = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const contractBadgeColor = (code) => {
  const map = { AMC: 'bg-blue-100 text-blue-700', CSC: 'bg-green-100 text-green-700', BW: 'bg-yellow-100 text-yellow-700' }
  return map[code] ?? 'bg-gray-100 text-gray-600'
}

export default function OwnedMachines() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
  if (loading) return <Spinner />

  return (
    <Layout title="My Machines" subtitle={`Welcome, ${currentCustomer.name}`}>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-6">{ownedMachines.length} machine(s) registered to your account</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {ownedMachines.map((machine) => {
            const firstVariant = machine.variants[0]
            const contract = firstVariant?.contractType

            return (
              <div
                key={machine.id}
                onClick={() => navigate(`/machines/${machine.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                {/* Machine Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={machine.images[0]}
                    alt={machine.machineName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${contractBadgeColor(contract?.code)}`}>
                    {contract?.code}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Name & Model */}
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-gray-800 leading-tight">{machine.machineName}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Model: {machine.modelNumber}</p>
                  </div>

                  {/* Category & Division */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {machine.category}
                    </span>
                    <span className="bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {machine.division}
                    </span>
                  </div>

                  {/* Variants */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                    {machine.variants.map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{v.name}</span>
                        <span className="font-semibold text-gray-700">{v.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500">Quantity</span>
                      <span className="font-semibold text-gray-700">{firstVariant?.quantity} unit(s)</span>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contract</span>
                      <span className="font-medium text-gray-700">{contract?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid From</span>
                      <span className="font-medium text-gray-700">{fmt(contract?.validFrom)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid To</span>
                      <span className="font-medium text-gray-700">{fmt(contract?.validTo)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Purchased</p>
                      <p className="text-xs font-semibold text-gray-700">{fmt(machine.purchasedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Paid</p>
                      <p className="text-sm font-bold text-blue-600">{fmtCurrency(machine.grandTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </Layout>
  )
}

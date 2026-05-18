import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { currentCustomer } from '../data/machines'
import ConfirmModal from './ConfirmModal'

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Owned Machines', path: '/machines' },
  { label: 'Calls', path: '/calls' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-30 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 px-5 pt-10 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-blue-100 text-xs font-medium uppercase tracking-widest">Customer Portal</p>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none cursor-pointer">
              ✕
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{currentCustomer.name}</p>
              <p className="text-blue-200 text-xs mt-0.5">{currentCustomer.zone}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const active = location.pathname === path
            return (
              <button
                key={label}
                onClick={() => handleNav(path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 space-y-1 border-t border-gray-100 pt-3">
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer text-left"
          >
            Logout
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            Delete Account
          </button>
        </div>
      </aside>

      <ConfirmModal
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout from the customer portal?"
        confirmLabel="Logout"
        confirmStyle="orange"
        onConfirm={() => { setConfirmLogout(false); onClose(); navigate('/login') }}
        onCancel={() => setConfirmLogout(false)}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete Account"
        confirmStyle="red"
        onConfirm={() => { setConfirmDelete(false); onClose(); navigate('/login') }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

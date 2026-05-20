import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import ConfirmModal from './ConfirmModal'
import { initialNotifications } from '../data/notifications'
import { logout } from '../api/auth'
import { useProfile } from '../context/ProfileContext'
import { getAvatarInitials } from '../utils/getAvatarInitials'

const fmtAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Layout({ title, subtitle, onBack, children }) {
  const { profile } = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const navigate = useNavigate()

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  const handleNotifClick = (notif) => {
    markRead(notif.id)
    setNotifOpen(false)
    navigate(notif.linkTo)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-10">

        {/* Left: menu or back */}
        {onBack ? (
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 cursor-pointer text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors mr-2"
          >
            ←
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mr-2"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
            <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
            <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-800 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        {/* Right: notification + profile */}
        <div className="flex items-center gap-2">

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false) }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Unread */}
                  {unread.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Unread</p>
                      {unread.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className="flex gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{fmtAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Read */}
                  {read.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Read</p>
                      {read.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50"
                        >
                          <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-500 leading-tight">{n.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{fmtAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notifications.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Icon */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false) }}
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {getAvatarInitials(profile?.name)}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Customer info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 truncate">{profile?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400 truncate">{profile?.email ?? '—'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/profile') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Update Profile
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); setConfirmLogout(true) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {children}

      <ConfirmModal
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout from the customer portal?"
        confirmLabel="Logout"
        confirmStyle="orange"
        onConfirm={async () => { setConfirmLogout(false); await logout(); navigate('/login') }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}

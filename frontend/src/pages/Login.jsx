import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const [loginType, setLoginType] = useState('mobile')
  const [form, setForm] = useState({ identifier: '', password: '' })
  const navigate = useNavigate()
  const location = useLocation()
  const resetSuccess = location.state?.resetSuccess ?? false

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Customer Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your service requests</p>
        </div>

        {/* Reset success toast */}
        {resetSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 text-center">
            Password reset successful. Please sign in.
          </div>
        )}

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setLoginType('mobile'); setForm({ identifier: '', password: '' }) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              loginType === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📱 Mobile Number
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('email'); setForm({ identifier: '', password: '' }) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              loginType === 'email'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✉️ Email
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {loginType === 'mobile' ? 'Mobile Number' : 'Email Address'}
            </label>
            {loginType === 'mobile' ? (
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <input
                type="email"
                placeholder="you@example.com"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

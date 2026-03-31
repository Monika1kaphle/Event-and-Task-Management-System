import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function SetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tempToken = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!tempToken) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-md text-center">
          <p className="text-red-400 text-sm mb-4">Invalid or missing token. Please use the OTP verification page.</p>
          <button onClick={() => navigate('/verify-otp')} className="text-[#4fd1c5] text-sm hover:underline">
            Go to OTP Verification
          </button>
        </div>
      </div>
    )
  }

  const getStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: '', color: '', width: '0%' }
    if (pwd.length < 6)   return { label: 'Too short', color: '#ef4444', width: '25%' }
    if (pwd.length < 8)   return { label: 'Weak', color: '#f97316', width: '50%' }
    if (!/[0-9]/.test(pwd) || !/[^a-zA-Z0-9]/.test(pwd))
                          return { label: 'Good', color: '#eab308', width: '75%' }
    return                       { label: 'Strong', color: '#22c55e', width: '100%' }
  }

  const strength = getStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Failed to set password.')

      // Show success — don't auto-login, redirect to login
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password Set!</h2>
          <p className="text-sm text-[#9ca3af] mb-1">Your account is now active.</p>
          <p className="text-sm text-[#9ca3af]">Redirecting to login in 3 seconds...</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-5 text-[#4fd1c5] text-sm hover:underline"
          >
            Go to Login now →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#2d5f5d] flex items-center justify-center shadow-[0_0_20px_rgba(45,95,93,0.4)]">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">E&T</span>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">
          <div className="mb-7 text-center">
            <div className="w-14 h-14 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#4fd1c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Create Your Password</h1>
            <p className="text-sm text-[#9ca3af]">Set a secure password to activate your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-white">
                  {showPassword
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-[#30363d] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-white">
                  {showConfirm
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {confirm.length > 0 && (
                <p className={`text-xs mt-1 ${password === confirm ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2d5f5d] hover:bg-[#3a7a78] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Setting password...
                </>
              ) : 'Set Password & Activate Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          <button onClick={() => navigate('/login')} className="text-[#4fd1c5] hover:underline">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  )
}
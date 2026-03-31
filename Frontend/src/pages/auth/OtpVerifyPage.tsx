import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function OtpVerifyPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !otp) {
      setError('Both fields are required.')
      return
    }
    if (otp.length !== 6) {
      setError('OTP must be 6 digits.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      })

      const data = await res.json()
      console.log('OTP verify response:', res.status, data)

      if (!res.ok) {
        setError(data.error || 'Verification failed.')
        return
      }

      if (!data.tempToken) {
        setError('No token received. Please try again.')
        return
      }

      // ✅ Navigate to set password
      navigate(`/set-password?token=${encodeURIComponent(data.tempToken)}`)

    } catch (err) {
      console.error('OTP verify error:', err)
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#2d5f5d] flex items-center justify-center shadow-[0_0_20px_rgba(45,95,93,0.4)]">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">E&T</span>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#4fd1c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Enter Your OTP</h1>
            <p className="text-sm text-[#9ca3af]">
              Check your email for the 6-digit code sent by the admin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="______"
                maxLength={6}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#4fd1c5] transition-colors tracking-[0.5em] text-center text-xl font-bold"
              />
              <p className="text-xs text-[#9ca3af] mt-1.5 text-center">
                {otp.length}/6 digits
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#2d5f5d] hover:bg-[#3a7a78] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : 'Verify OTP'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          Already have a password?{' '}
          <button onClick={() => navigate('/login')} className="text-[#4fd1c5] hover:underline">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  )
}
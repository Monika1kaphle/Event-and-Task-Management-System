import React, { useState, useEffect } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    server: '',
  })
  const [success, setSuccess] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  useEffect(() => {
    if (!resetToken) {
      setInvalidToken(true)
    }
  }, [resetToken])

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password: string) => password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      server: '',
    }

    // Validation
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (newErrors.email || newErrors.password || newErrors.confirmPassword) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetToken,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setErrors(prev => ({
          ...prev,
          server: data.error || 'Failed to reset password',
        }))
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        server: 'Cannot connect to server. Is backend running?',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* ── Logo ── */}
          <div className="text-center mb-8">
            <div className="inline-block bg-[#2d5f5d] rounded-lg p-3 mb-4">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <h1 className="text-2xl font-bold text-white">E&T Management</h1>
          </div>

          {/* ── Content ── */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="inline-block bg-red-500 rounded-full p-3 mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Invalid or expired link
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-[#2d5f5d] hover:bg-[#3d7f7d] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Request new reset link
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* ── Logo ── */}
          <div className="text-center mb-8">
            <div className="inline-block bg-[#2d5f5d] rounded-lg p-3 mb-4">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <h1 className="text-2xl font-bold text-white">E&T Management</h1>
          </div>

          {/* ── Content ── */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <div className="mb-4">
              <div className="inline-block bg-[#2d5f5d] rounded-full p-3 mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Password reset successfully!
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Your password has been reset. You can now sign in with your new password.
            </p>

            <p className="text-xs text-gray-500">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#2d5f5d] rounded-lg p-3 mb-4">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">E&T Management</h1>
        </div>

        {/* ── Content ── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Create new password
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter your email and set a new password to regain access to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
                className={`w-full rounded-lg bg-[#0d1117] border px-4 py-3 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:bg-gray-900 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-800 focus:border-[#2d5f5d] focus:ring-[#2d5f5d]'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={`w-full rounded-lg bg-[#0d1117] border px-4 py-3 pr-11 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:bg-gray-900 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-800 focus:border-[#2d5f5d] focus:ring-[#2d5f5d]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={`w-full rounded-lg bg-[#0d1117] border px-4 py-3 pr-11 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:bg-gray-900 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-800 focus:border-[#2d5f5d] focus:ring-[#2d5f5d]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.server && (
              <p className="text-red-400 text-sm text-center bg-red-500 bg-opacity-10 rounded p-2">
                {errors.server}
              </p>
            )}

            <Button type="submit" fullWidth isLoading={isLoading}>
              Reset Password <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#4fd1c5] hover:underline transition-colors"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  )
}

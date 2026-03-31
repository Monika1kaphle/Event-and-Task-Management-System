import React, { useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useNavigate } from 'react-router-dom'

type LoginFormProps = {
  onLoginSuccess: (user: any) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 'email' | 'password' | 'otp'
  const [step, setStep] = useState<'email' | 'password' | 'otp'>('email')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    otp: '',
    server: '',
  })

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const clearErrors = () =>
    setErrors({ email: '', password: '', otp: '', server: '' })

  // ── STEP 1: Check email ──
  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setErrors(p => ({ ...p, email: 'Email is required' }))
      return
    }
    if (!validateEmail(formData.email)) {
      setErrors(p => ({ ...p, email: 'Please enter a valid email address' }))
      return
    }

    setIsLoading(true)
    clearErrors()

    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json()

      if (res.ok) {
        // Account is Pending OTP — go to OTP step
        setStep('otp')
      } else if (
        data.error?.includes('already active') ||
        data.error?.includes('login with your password')
      ) {
        // Active account — go to password step
        setStep('password')
      } else {
        setErrors(p => ({ ...p, server: data.error || 'Failed to check email' }))
      }
    } catch {
      setErrors(p => ({ ...p, server: 'Cannot connect to server. Is backend running?' }))
    } finally {
      setIsLoading(false)
    }
  }

  // ── STEP 2a: Password login (admin, active dept head, active member, client) ──
  const handlePasswordSubmit = async () => {
    if (!formData.password) {
      setErrors(p => ({ ...p, password: 'Password is required' }))
      return
    }

    setIsLoading(true)
    clearErrors()

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLoginSuccess(data.user)
      } else {
        setErrors(p => ({ ...p, password: data.error || 'Invalid password' }))
      }
    } catch {
      setErrors(p => ({ ...p, server: 'Cannot connect to server.' }))
    } finally {
      setIsLoading(false)
    }
  }

  // ── STEP 2b: OTP verify (Pending OTP accounts — dept head first login) ──
  const handleOtpSubmit = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors(p => ({ ...p, otp: 'Please enter a valid 6-digit code' }))
      return
    }

    setIsLoading(true)
    clearErrors()

    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      })
      const data = await res.json()

      if (res.ok && data.tempToken) {
        // Pending OTP account (dept head / member): must set password first
        navigate(`/set-password?token=${encodeURIComponent(data.tempToken)}`)
      } else if (res.ok && data.token) {
        // Active user with OTP login: log them in directly
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLoginSuccess(data.user)
      } else {
        setErrors(p => ({ ...p, otp: data.error || 'Invalid OTP' }))
      }
    } catch {
      setErrors(p => ({ ...p, server: 'Cannot connect to server.' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'email') handleEmailSubmit()
    else if (step === 'password') handlePasswordSubmit()
    else handleOtpSubmit()
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── EMAIL STEP ── */}
        {step === 'email' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-sm text-gray-400">
              Enter your email to continue
            </p>
            <Input
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={isLoading}
              autoFocus
            />
          </div>
        )}

        {/* ── PASSWORD STEP ── */}
        {step === 'password' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Enter your password</h2>
            <p className="text-sm text-gray-400">
              Signing in as{' '}
              <span className="text-white font-medium">{formData.email}</span>
            </p>
            <button
              type="button"
              onClick={() => { setStep('email'); clearErrors() }}
              className="text-xs text-[#4fd1c5] hover:underline flex items-center"
            >
              ← Change email
            </button>
            <div className="w-full space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  autoFocus
                  className={`w-full rounded-lg bg-[#161b22] border px-4 py-3 pr-11 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:bg-gray-900 ${
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 animate-in slide-in-from-top-1 fade-in">{errors.password}</p>
              )}
            </div>
          </div>
        )}

        {/* ── OTP STEP ── */}
        {step === 'otp' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Enter your OTP</h2>
            <p className="text-sm text-gray-400">
              Enter the 6-digit code sent to{' '}
              <span className="text-white font-medium">{formData.email}</span>
            </p>
            <button
              type="button"
              onClick={() => { setStep('email'); clearErrors() }}
              className="text-xs text-[#4fd1c5] hover:underline flex items-center"
            >
              ← Change email
            </button>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={formData.otp}
              onChange={e =>
                setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
              }
              error={errors.otp}
              maxLength={6}
              className="text-center tracking-widest font-mono text-lg"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-[#9ca3af] text-center">
              {formData.otp.length}/6 digits entered
            </p>
          </div>
        )}

        {errors.server && (
          <p className="text-red-400 text-sm text-center">{errors.server}</p>
        )}

        <Button type="submit" fullWidth isLoading={isLoading}>
          {step === 'email' && <>Continue with Email <ArrowRight className="ml-2 h-4 w-4" /></>}
          {step === 'password' && <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
          {step === 'otp' && <>Verify & Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-4">
        By clicking continue, you agree to our{' '}
        <a href="#" className="hover:text-[#2d5f5d] transition-colors">Terms</a>{' '}
        and{' '}
        <a href="#" className="hover:text-[#2d5f5d] transition-colors">Privacy</a>.
      </p>
    </div>
  )
}
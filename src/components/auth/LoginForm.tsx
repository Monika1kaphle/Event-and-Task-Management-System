import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type LoginFormProps = {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    server: '',
  })

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ email: '', otp: '', server: '' })

    // STEP 1: SEND OTP
    if (step === 'email') {
      if (!formData.email) {
        setErrors((prev) => ({ ...prev, email: 'Email is required' }))
        return
      }

      if (!validateEmail(formData.email)) {
        setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }))
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch('http://localhost:3000/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        })

        const data = await response.json()

        if (response.ok) {
          setStep('otp')
        } else {
          setErrors((prev) => ({ ...prev, server: data.error || 'Failed to send OTP' }))
        }
      } catch {
        setErrors((prev) => ({
          ...prev,
          server: 'Cannot connect to server. Is Backend running?',
        }))
      } finally {
        setIsLoading(false)
      }
    }

    // STEP 2: VERIFY OTP
    else {
      if (!formData.otp || formData.otp.length !== 6) {
        setErrors((prev) => ({ ...prev, otp: 'Please enter a valid 6-digit code' }))
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // ✅ THIS IS THE KEY LINE
          onLoginSuccess()
        } else {
          setErrors((prev) => ({ ...prev, otp: data.error || 'Invalid OTP' }))
        }
      } catch {
        setErrors((prev) => ({ ...prev, server: 'Cannot connect to server.' }))
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* EMAIL STEP */}
        <div className={step === 'email' ? 'block space-y-4' : 'hidden'}>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-gray-400">
            Enter your email to receive a verification code
          </p>

          <Input
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* OTP STEP */}
        <div className={step === 'otp' ? 'block space-y-4' : 'hidden'}>
          <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
          <p className="text-sm text-gray-400 mb-4">
            We sent a 6-digit code to{' '}
            <span className="text-white font-medium">{formData.email}</span>
          </p>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="text-xs text-[#2d5f5d] hover:text-[#3d7a77] flex items-center mb-2 transition-colors"
          >
            ← Change email
          </button>

          <Input
            type="text"
            placeholder="123456"
            value={formData.otp}
            onChange={(e) =>
              setFormData({
                ...formData,
                otp: e.target.value.replace(/\D/g, '').slice(0, 6),
              })
            }
            error={errors.otp}
            maxLength={6}
            className="text-center tracking-widest font-mono text-lg"
            disabled={isLoading}
          />
        </div>

        {errors.server && (
          <p className="text-red-400 text-sm text-center">{errors.server}</p>
        )}

        <Button type="submit" fullWidth isLoading={isLoading}>
          {step === 'email' ? 'Continue with Email' : 'Verify & Login'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-4">
        By clicking continue, you agree to our{' '}
        <a
          href="#"
          className="text-gray-400 hover:text-[#2d5f5d] transition-colors"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="#"
          className="text-gray-400 hover:text-[#2d5f5d] transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
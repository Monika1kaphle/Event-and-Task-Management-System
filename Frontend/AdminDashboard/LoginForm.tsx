import React, { useState } from 'react'
import { ArrowRight, Mail, Lock } from 'lucide-react'
import { Button } from './UI/Button'
import { Input } from './UI/Input'
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  })
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
  })
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({
      email: '',
      otp: '',
    })
    if (step === 'email') {
      if (!formData.email) {
        setErrors((prev) => ({
          ...prev,
          email: 'Email is required',
        }))
        return
      }
      if (!validateEmail(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: 'Please enter a valid email address',
        }))
        return
      }
      setIsLoading(true)
      // Simulate API call to send OTP
      setTimeout(() => {
        setIsLoading(false)
        setStep('otp')
      }, 1000)
    } else {
      if (!formData.otp) {
        setErrors((prev) => ({
          ...prev,
          otp: 'OTP is required',
        }))
        return
      }
      if (formData.otp.length < 6) {
        setErrors((prev) => ({
          ...prev,
          otp: 'OTP must be 6 digits',
        }))
        return
      }
      setIsLoading(true)
      // Simulate login
      setTimeout(() => {
        setIsLoading(false)
        alert('Login successful!')
      }, 1500)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div
          className={`transition-all duration-300 ${step === 'email' ? 'block' : 'hidden'}`}
        >
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
        </div>

        <div
          className={`transition-all duration-300 ${step === 'otp' ? 'block' : 'hidden'}`}
        >
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-xs text-[#2d5f5d] hover:text-[#3d7a77] flex items-center mb-2 transition-colors"
            >
              ← Change email
            </button>
            <p className="text-sm text-gray-400 mb-4">
              We sent a 6-digit code to{' '}
              <span className="text-white font-medium">{formData.email}</span>
            </p>
          </div>
          <Input
            id="otp"
            name="otp"
            type="text"
            label="One-Time Password"
            placeholder="123456"
            value={formData.otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6)
              setFormData({
                ...formData,
                otp: val,
              })
            }}
            error={errors.otp}
            maxLength={6}
            autoComplete="one-time-code"
            className="tracking-widest font-mono text-center text-lg"
          />
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="group relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center">
          {step === 'email' ? 'Continue with Email' : 'Verify & Login'}
          {!isLoading && (
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </span>
      </Button>

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
    </form>
  )
}

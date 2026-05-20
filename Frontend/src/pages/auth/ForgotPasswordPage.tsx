import React, { useState } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useNavigate } from 'react-router-dom'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send reset link')
      }
    } catch (err) {
      setError('Cannot connect to server. Is backend running?')
    } finally {
      setIsLoading(false)
    }
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
          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset your password
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={error}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <Button type="submit" fullWidth isLoading={isLoading}>
                  Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center text-sm text-[#4fd1c5] hover:text-white transition-colors py-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
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
                Email sent!
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Check your email for a link to reset your password. The link will expire in 1 hour.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#2d5f5d] hover:bg-[#3d7f7d] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to login
              </button>
            </div>
          )}
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

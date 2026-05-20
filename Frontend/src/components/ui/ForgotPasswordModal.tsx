import { useState } from 'react'
import { X } from 'lucide-react'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleRequestReset = async () => {
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccess('Password reset link sent to your email. Please check your inbox.')
        setEmail('')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to send reset link')
      }
    } catch (error) {
      console.error('Error requesting password reset:', error)
      setError('Error sending reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg w-96 p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Forgot Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-950/30 border border-red-800 rounded px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-950/30 border border-green-800 rounded px-3 py-2 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-400 text-sm">
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </p>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#4fd1c5]"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <button
              onClick={handleRequestReset}
              disabled={isLoading}
              className="flex-1 bg-[#4fd1c5] text-black px-4 py-2 rounded font-semibold hover:bg-[#3bb8ad] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

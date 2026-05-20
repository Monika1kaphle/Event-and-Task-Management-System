import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function GoogleCallbackPage({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const code = searchParams.get('code')
        
        if (!code) {
          setError('No authorization code received')
          return
        }

        // Send code to backend
        const res = await fetch('http://localhost:3000/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()

        if (res.ok) {
          // Save token and user
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          // Call the callback
          onLoginSuccess(data.user)
          
          // Redirect to appropriate dashboard
          const user = data.user
          if (user.role === 'ADMIN') {
            navigate('/dashboard')
          } else if (user.role === 'DEPT_HEAD') {
            navigate('/dept-dashboard')
          } else if (user.role === 'MEMBER') {
            navigate('/member-dashboard')
          } else {
            navigate('/user-dashboard')
          }
        } else {
          setError(data.error || 'Authentication failed')
        }
      } catch (err) {
        setError('Failed to authenticate with Google')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate, onLoginSuccess])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">❌ {error}</div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#2d5f5d] hover:bg-[#3d7f7d] text-white py-2 px-6 rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <svg className="w-12 h-12 text-[#2d5f5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-gray-400 mt-4">Authenticating with Google...</p>
      </div>
    </div>
  )
}

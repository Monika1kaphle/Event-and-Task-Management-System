import { useState } from 'react'

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleRedirect = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Get the Google Auth URL from backend
      const res = await fetch('http://localhost:3000/api/auth/google-auth-url')
      const data = await res.json()

      if (data.authUrl) {
        // Redirect to Google OAuth consent screen
        window.location.href = data.authUrl
      } else {
        setError('Failed to get Google auth URL')
      }
    } catch (err: any) {
      setError('Cannot connect to server')
      console.error('Google auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true)
    setError('')

    try {
      // Get the ID token from Google
      const token = credentialResponse.credential

      // Send to backend to verify and create/login user
      const res = await fetch('http://localhost:3000/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: token }),
      })

      const data = await res.json()

      if (res.ok) {
        // Save token and user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        return {
          success: true,
          user: data.user,
          isNewUser: data.isNewUser,
        }
      } else {
        setError(data.error || 'Google authentication failed')
        return { success: false }
      }
    } catch (err: any) {
      const errorMsg = 'Cannot connect to server'
      setError(errorMsg)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google authentication failed')
  }

  return {
    isLoading,
    error,
    handleGoogleRedirect,
    handleGoogleSuccess,
    handleGoogleError,
    setError,
  }
}

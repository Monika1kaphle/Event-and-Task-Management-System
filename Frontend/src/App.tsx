import { useEffect, useState } from 'react'
import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './components/dashboard/DashboardPage'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check for existing authentication token
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
  }

  return isLoggedIn ? (
    <DashboardPage onLogout={handleLogout} />
  ) : (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  )
}

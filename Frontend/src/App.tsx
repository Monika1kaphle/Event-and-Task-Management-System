import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UserManagement } from './pages/UserManagement'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setIsLoggedIn(true)
  }, [])

  const handleLoginSuccess = () => setIsLoggedIn(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage onLogout={handleLogout} />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}
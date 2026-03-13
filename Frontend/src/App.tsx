import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './pages/Admin/Dashboard/DashboardPage'
import { UserManagement } from './pages/Admin/UserManagement/UserManagement'
import { EventManagement } from './pages/Admin/EventManagements.tsx/EventManagement'
import { PostEvent } from './pages/Admin/EventManagements.tsx/PostEvent'
import { UserDashboardPage } from './pages/Users/UserDashboardPage'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only restore session if BOTH token and user exist
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    // userData already saved to localStorage inside LoginForm
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return null

  // Helper guards
  const isAdmin = user?.role === 'ADMIN'
  const isClient = user?.role === 'CLIENT'
  const isLoggedIn = !!user

  return (
    <Router>
      <Routes>

        {/* LOGIN — redirect away if already logged in */}
        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/user-dashboard" replace />
            )
          }
        />

        {/* ONBOARDING — only for Pending OTP users */}
        <Route
          path="/setup-password"
          element={
            user?.status === 'Pending OTP' ? (
              <div className="text-white p-10">Password Setup Page Coming Soon...</div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ROOT — smart redirect based on role */}
        <Route
          path="/"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> :
            user.status === 'Pending OTP' ? <Navigate to="/setup-password" replace /> :
            isAdmin ? <Navigate to="/dashboard" replace /> :
            <Navigate to="/user-dashboard" replace />
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/dashboard"
          element={isAdmin ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users"
          element={isAdmin ? <UserManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events"
          element={isAdmin ? <EventManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events/create"
          element={isAdmin ? <PostEvent onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* CLIENT/USER ROUTE */}
        <Route
          path="/user-dashboard"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> :
            isAdmin ? <Navigate to="/dashboard" replace /> :
            <UserDashboardPage onLogout={handleLogout} />
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  )
}
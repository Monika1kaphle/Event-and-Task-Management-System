import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { LoginPage } from './components/auth/LoginPage'
import { DashboardPage } from './pages/Admin/Dashboard/DashboardPage'
import { UserManagement } from './pages/Admin/UserManagement/UserManagement'
import { EventManagement } from './pages/Admin/EventManagements/EventManagement'
import { PostEvent } from './pages/Admin/EventManagements/PostEvent'
import { UserDashboardPage } from './pages/Users/UserDashboardPage'
import { PaymentSuccess } from './pages/User/MyBookings/PaymentSuccess'
import { DepartmentManagement } from './pages/Admin/DepartmentManagement/DepartmentManagement'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return null

  const isAdmin = user?.role === 'ADMIN'
  const isLoggedIn = !!user

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
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

        {/* ONBOARDING */}
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

        {/* ROOT */}
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

        {/* CLIENT ROUTE */}
        <Route
          path="/user-dashboard"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> :
            isAdmin ? <Navigate to="/dashboard" replace /> :
            <UserDashboardPage onLogout={handleLogout} />
          }
        />

        {/* ✅ PAYMENT ROUTES — must be BEFORE the * fallback */}
        <Route
          path="/payment/success"
          element={<PaymentSuccess />}
        />
        <Route
          path="/payment/failure"
          element={<Navigate to="/user-dashboard" replace />}
        />

        {/* FALLBACK — must always be LAST */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
        <Route
  path="/departments"
  element={isAdmin ? <DepartmentManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
/>

      </Routes>
    </Router>

    
  )
}
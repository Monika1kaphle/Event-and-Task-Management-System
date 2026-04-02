import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/Admin/Dashboard/DashboardPage'
import { UserManagement } from './pages/Admin/UserManagement/UserManagement'
import { EventManagement } from './pages/Admin/EventManagements/EventManagement'
import { PostEvent } from './pages/Admin/EventManagements/PostEvent'
import { TaskManagement } from './pages/Admin/TaskManagement/TaskManagement'
import { UserDashboardPage } from './pages/Users/UserDashboardPage'
import { PaymentSuccess } from './pages/User/MyBookings/PaymentSuccess'
import { DepartmentManagement } from './pages/Admin/DepartmentManagement/DepartmentManagement'
import { SetPasswordPage } from './pages/auth/SetPasswordPages'
import { DeptHeadDashboard } from './pages/DepartmentHead/DeptHeadDashboard'

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

  const isAdmin    = user?.role === 'ADMIN'
  const isDeptHead = user?.role === 'DEPT_HEAD'
  const isMember   = user?.role === 'MEMBER'
  const isLoggedIn = !!user

  return (
    <Router>
      <Routes>

        {/* ── LOGIN ── */}
        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : isDeptHead ? (
              <Navigate to="/dept-dashboard" replace />
            ) : isMember ? (
              <Navigate to="/member-dashboard" replace />
            ) : (
              <Navigate to="/user-dashboard" replace />
            )
          }
        />

        {/* ── SET PASSWORD (dept head / member first login after OTP) ── */}
        <Route
          path="/set-password"
          element={<SetPasswordPage />}
        />

        {/* ── LEGACY ONBOARDING (keep for backwards compat) ── */}
        <Route
          path="/setup-password"
          element={
            user?.status === 'Pending OTP' ? (
              <Navigate to="/set-password" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ── ROOT REDIRECT ── */}
        <Route
          path="/"
          element={
            !isLoggedIn                     ? <Navigate to="/login"            replace /> :
            user.status === 'Pending OTP'   ? <Navigate to="/set-password"     replace /> :
            isAdmin                         ? <Navigate to="/dashboard"        replace /> :
            isDeptHead                      ? <Navigate to="/dept-dashboard"   replace /> :
            isMember                        ? <Navigate to="/member-dashboard" replace /> :
                                              <Navigate to="/user-dashboard"   replace />
          }
        />

        {/* ── ADMIN ROUTES ── */}
        <Route
          path="/dashboard"
          element={isAdmin ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users"
          element={isAdmin ? <UserManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/departments"
          element={isAdmin ? <DepartmentManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events"
          element={isAdmin ? <EventManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events/create"
          element={isAdmin ? <PostEvent onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tasks"
          element={
            isAdmin || isDeptHead ? (
              <TaskManagement onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── DEPT HEAD ROUTE ── */}
        <Route
          path="/dept-dashboard"
          element={
            !isLoggedIn   ? <Navigate to="/login" replace /> :
            !isDeptHead   ? <Navigate to="/" replace /> :
            <DeptHeadDashboard onLogout={handleLogout} />
          }
        />

        {/* ── MEMBER ROUTE (placeholder until you build the page) ── */}
        <Route
          path="/member-dashboard"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> :
            !isMember   ? <Navigate to="/" replace /> :
            <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
              <p className="text-xl font-semibold text-[#4fd1c5]">Member Dashboard — Coming Soon</p>
            </div>
          }
        />

        {/* ── CLIENT ROUTE ── */}
        <Route
          path="/user-dashboard"
          element={
            !isLoggedIn ? <Navigate to="/login"    replace /> :
            isAdmin     ? <Navigate to="/dashboard" replace /> :
            <UserDashboardPage onLogout={handleLogout} />
          }
        />

        {/* ── PAYMENT ROUTES ── */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<Navigate to="/user-dashboard" replace />} />

        {/* ── FALLBACK — always last ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  )
}
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/Admin/Dashboard/DashboardPage'
import { UserManagement } from './pages/Admin/UserManagement/UserManagement'
import { EventManagement } from './pages/Admin/EventManagements/EventManagement'
import { PostEvent } from './pages/Admin/EventManagements/PostEvent'
import { UserDashboardPage } from './pages/Users/UserDashboardPage'
import { PaymentSuccess } from './pages/User/MyBookings/PaymentSuccess'
import { DepartmentManagement } from './pages/Admin/DepartmentManagement/DepartmentManagement'
import { SetPasswordPage } from './pages/auth/SetPasswordPages'
import { OtpVerifyPage } from './pages/auth/OtpVerifyPage'
import { TaskManagement } from './pages/Admin/TaskManagement/TaskManagement'

function LoginWrapper({ setUser }: { setUser: (u: any) => void }) {
  const navigate = useNavigate()

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }

    if (userData.status === 'Pending OTP') {
      const token = userData.token || localStorage.getItem('token')
      navigate(`/set-password?token=${token}`)
    } else {
      const roles: Record<string, string> = {
        'ADMIN': '/dashboard',
        'DEPT_HEAD': '/dept-dashboard',
        'MEMBER': '/member-dashboard',
      }
      navigate(roles[userData.role] || '/user-dashboard', { replace: true })
    }
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

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
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
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

        {/* ── AUTH ROUTES ── */}
        <Route path="/login" element={<LoginWrapper setUser={setUser} />} />
        <Route path="/verify-otp" element={<OtpVerifyPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* ── ROOT REDIRECT ── */}
        <Route
          path="/"
          element={
            !isLoggedIn                   ? <Navigate to="/login"           replace /> :
            user.status === 'Pending OTP' ? <Navigate to="/verify-otp"      replace /> :
            isAdmin                       ? <Navigate to="/dashboard"        replace /> :
            isDeptHead                    ? <Navigate to="/dept-dashboard"   replace /> :
            isMember                      ? <Navigate to="/member-dashboard" replace /> :
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
          element={isAdmin ? <TaskManagement onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* ── DEPT HEAD ROUTES ── */}
        <Route
          path="/dept-dashboard"
          element={
            isDeptHead ? (
              <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4 text-[#4fd1c5]">Department Head Dashboard</h1>
                <p className="text-gray-400 mb-8">Welcome back, {user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  Logout
                </button>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        {/* ── MEMBER ROUTES ── */}
        <Route
          path="/member-dashboard"
          element={
            isMember ? (
              <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
                <p className="text-xl font-semibold text-[#4fd1c5]">Member Dashboard — Coming Soon</p>
              </div>
            ) : <Navigate to="/login" replace />
          }
        />

        {/* ── CLIENT ROUTES ── */}
        <Route
          path="/user-dashboard"
          element={isLoggedIn ? <UserDashboardPage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* ── PAYMENT ROUTES ── */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<Navigate to="/user-dashboard" replace />} />

        {/* ── FALLBACK ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  )
}
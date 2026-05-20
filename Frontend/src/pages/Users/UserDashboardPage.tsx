import { useState, useEffect, useRef } from 'react'
import { UserSidebar } from '../../components/layout/UserSidebar'
import { BookingStatusCards } from '../User/UserDashboard/BookingStatusCard'
import { UpcomingBookingsCard } from '../User/UserDashboard/UpcomingBookingsCard'
import { RecentInvitationsCard } from '../User/UserDashboard/RecentInvitation'
import { EventInvitationsPage } from '../User/UserDashboard/EventInvitationsPage'
import { MyBookingsPage } from '../User/MyBookings/Mybookingspage'
import { Bell, Search } from 'lucide-react'
import { StreakBadge } from '../../components/ui/StreakBadge'
import { StreakCelebration } from '../../components/ui/StreakCelebration'
import { ProfileDropdown } from '../../components/ui/ProfileDropdown'
import { ProfileModal } from '../../components/ui/ProfileModal'
import { ChangePasswordModal } from '../../components/ui/ChangePasswordModal'
import { ForgotPasswordModal } from '../../components/ui/ForgotPasswordModal'

interface UserDashboardPageProps {
  onLogout: () => void
}

export function UserDashboardPage({ onLogout }: UserDashboardPageProps) {
  const [activeItem, setActiveItem] = useState('Home')
  const [stats, setStats] = useState({
    activeBookings: 0,
    attendedEvents: 0,
    upcomingCount: 0,
  })
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('CLIENT')
  const [userInitials, setUserInitials] = useState('US')
  const [streak, setStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const streakCalled = useRef(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (savedUser.name) {
          setUserName(savedUser.name)
          const parts = savedUser.name.trim().split(' ')
          const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
          setUserInitials(initials.toUpperCase())
        }
        if (savedUser.email) {
          setUserEmail(savedUser.email)
        }
        if (savedUser.role) {
          setUserRole(savedUser.role)
        }

        if (!streakCalled.current) {
          streakCalled.current = true
          const streakRes = await fetch('http://localhost:3000/api/client/streak', { method: 'PUT', headers })
          if (streakRes.ok) {
            const streakData = await streakRes.json()
            setStreak(streakData.streak)
            if (!streakData.alreadyUpdated) setShowCelebration(true)
          }
        }

        const statsRes = await fetch('http://localhost:3000/api/client/dashboard-stats', { headers })
        const eventsRes = await fetch('http://localhost:3000/api/client/events', { headers })

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          let upcomingCount = 0
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json()
            upcomingCount = eventsData.filter((e: any) => new Date(e.event_date) >= new Date()).length
          }
          setStats({
            activeBookings: statsData.activeBookings || 0,
            attendedEvents: statsData.attendedEvents || 0,
            upcomingCount,
          })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      }
    }
    fetchDashboardData()
  }, [])

  const handleNavigateToBookings = () => setActiveItem('My Bookings')

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'CLIENT': 'User',
      'ADMIN': 'Administrator',
      'DEPT_HEAD': 'Dept Head',
      'MEMBER': 'Member',
    }
    return roleMap[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'CLIENT': { bg: 'bg-blue-950', text: 'text-blue-400' },
      'ADMIN': { bg: 'bg-red-950', text: 'text-red-400' },
      'DEPT_HEAD': { bg: 'bg-purple-950', text: 'text-purple-400' },
      'MEMBER': { bg: 'bg-green-950', text: 'text-green-400' },
    }
    return colorMap[role] || { bg: 'bg-gray-800', text: 'text-gray-400' }
  }

  const getPageTitle = () => {
    switch (activeItem) {
      case 'My Bookings': return { title: 'My Bookings', subtitle: 'Your booked events and transactions' }
      case 'Event Invitations': return { title: 'Event Invitations', subtitle: 'Events you have been invited to' }
      case 'User Settings': return { title: 'Settings', subtitle: 'Manage your account preferences' }
      default: return { title: 'My Dashboard', subtitle: `Welcome back, ${userName}` }
    }
  }

  const { title, subtitle } = getPageTitle()

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* ── STREAK OVERLAY ── */}
      {showCelebration && streak > 0 && (
        <StreakCelebration streak={streak} onComplete={() => setShowCelebration(false)} />
      )}

      {/* ── SIDEBAR CONTAINER ── */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-[#0f1419] border-r border-gray-800/50">
        <UserSidebar activeItem={activeItem} onNavigate={setActiveItem} onLogout={onLogout} />
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="flex-shrink-0 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800/50 px-8 py-4 flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <span className={`${getRoleBadgeColor(userRole).bg} ${getRoleBadgeColor(userRole).text} px-3 py-1 rounded-full text-xs font-semibold`}>
                {formatRole(userRole)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-[#161b22] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#4fd1c5] w-64 transition-all"
              />
            </div>

            <div style={{
              opacity: showCelebration ? 0 : 1,
              transform: showCelebration ? 'scale(0.5)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <StreakBadge streak={streak} />
            </div>

            <button className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#4fd1c5] shadow-[0_0_8px_#4fd1c5]" />
            </button>

            <ProfileDropdown
              userName={userName}
              userInitials={userInitials}
              userRole={userRole}
              onLogout={onLogout}
              onOpenProfile={() => setShowProfileModal(true)}
              onOpenChangePassword={() => setShowChangePasswordModal(true)}
              onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
            />
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f1419]">
          <div className="max-w-7xl mx-auto p-8 space-y-8">
            {activeItem === 'My Bookings' ? (
              <MyBookingsPage />
            ) : activeItem === 'Event Invitations' ? (
              <EventInvitationsPage />
            ) : activeItem === 'User Settings' ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-500 space-y-3 bg-[#161b22] rounded-2xl border border-gray-800/50">
                <p className="text-lg font-medium text-gray-400">User Settings</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            ) : (
              /* HOME VIEW */
              <>
                <BookingStatusCards
                  activeCount={stats.activeBookings}
                  attendedCount={stats.attendedEvents}
                  upcomingCount={stats.upcomingCount}
                />

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-[#161b22] rounded-2xl border border-gray-800/50 overflow-hidden">
                    <UpcomingBookingsCard onEventClick={handleNavigateToBookings} />
                  </div>

                  <div className="bg-[#161b22] rounded-2xl border border-gray-800/50 overflow-hidden pb-4">
                    <RecentInvitationsCard onBookEvent={handleNavigateToBookings} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userName={userName}
        userEmail={userEmail}
        onEditName={(newName) => setUserName(newName)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}
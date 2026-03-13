import React, { useState, useEffect } from 'react'
import { UserSidebar } from '../../components/layout/UserSidebar'
import { BookingStatusCards } from '../User/UserDashboard/BookingStatusCard'
import { UpcomingBookingsCard } from '../User/UserDashboard/UpcomingBookingsCard'
import { RecentInvitationsCard } from '../User/UserDashboard/RecentInvitation'
import { MyBookingsPage } from '../User/MyBookings/Mybookingspage'
import { Bell, Search, Settings } from 'lucide-react'

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
  const [userInitials, setUserInitials] = useState('US')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (savedUser.name) {
          setUserName(savedUser.name)
          const parts = savedUser.name.trim().split(' ')
          const initials =
            parts.length >= 2
              ? parts[0][0] + parts[parts.length - 1][0]
              : parts[0].slice(0, 2)
          setUserInitials(initials.toUpperCase())
        }

        const statsRes = await fetch(
          'http://localhost:3000/api/client/dashboard-stats',
          { headers }
        )
        const eventsRes = await fetch(
          'http://localhost:3000/api/client/events',
          { headers }
        )

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          let upcomingCount = 0
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json()
            upcomingCount = eventsData.filter(
              (e: any) => new Date(e.event_date) >= new Date()
            ).length
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

  const handleNavigateToBookings = () => {
    setActiveItem('My Bookings')
  }

  // Page title based on active sidebar item
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
    <div className="min-h-screen bg-[#0f1419] text-white flex relative">
      {/* SIDEBAR */}
      <UserSidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onLogout={onLogout}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 overflow-y-auto h-screen custom-scrollbar">

        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-[#0f1419]/95 backdrop-blur-sm border-b border-gray-800/50 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-[#161b22] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#2d5f5d] w-64 transition-colors"
              />
            </div>
            <button className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#4fd1c5] shadow-[0_0_5px_#4fd1c5]" />
            </button>
            <button className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-[#161b22] shadow-lg flex items-center justify-center text-sm font-bold cursor-pointer">
              {userInitials}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT — switches based on sidebar */}
        {activeItem === 'My Bookings' ? (
          // ── My Bookings Page ──
          <MyBookingsPage />

        ) : activeItem === 'Event Invitations' ? (
          // ── Event Invitations (placeholder) ──
          <div className="p-8 flex flex-col items-center justify-center py-32 text-gray-500 space-y-3">
            <Bell className="h-16 w-16 text-gray-700" />
            <p className="text-lg font-medium text-gray-400">Event Invitations</p>
            <p className="text-sm">Coming soon...</p>
          </div>

        ) : activeItem === 'User Settings' ? (
          // ── User Settings (placeholder) ──
          <div className="p-8 flex flex-col items-center justify-center py-32 text-gray-500 space-y-3">
            <Settings className="h-16 w-16 text-gray-700" />
            <p className="text-lg font-medium text-gray-400">User Settings</p>
            <p className="text-sm">Coming soon...</p>
          </div>

        ) : (
          // ── Home Dashboard ──
          <div className="p-8 space-y-6">
            {/* Top Row: Status Cards */}
            <BookingStatusCards
              activeCount={stats.activeBookings}
              attendedCount={stats.attendedEvents}
              upcomingCount={stats.upcomingCount}
            />

            {/* Events Card — fixed height, scrolls inside */}
            <div style={{ height: '420px' }} className="min-h-0">
              <UpcomingBookingsCard onEventClick={handleNavigateToBookings} />
            </div>

            {/* Recent Invitations */}
            <div className="w-full pb-8">
              <RecentInvitationsCard onBookEvent={handleNavigateToBookings} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
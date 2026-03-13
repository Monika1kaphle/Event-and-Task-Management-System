import React, { useState, useEffect } from 'react'
import { UserSidebar } from '../../components/layout/UserSidebar'
import { BookingStatusCards } from '../User/UserDashboard/BookingStatusCard'
import { UpcomingBookingsCard } from '../User/UserDashboard/UpcomingBookingsCard'
import { RecentInvitationsCard } from '../User/UserDashboard/RecentInvitation'
import { UserCalendarCard } from '../User/UserDashboard/UserCalendarCard'
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

        // Get user info from localStorage
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

        // Fetch booking stats
        const statsRes = await fetch(
          'http://localhost:3000/api/client/dashboard-stats',
          { headers }
        )

        // Fetch all events to count upcoming
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

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex relative">
      {/* SIDEBAR */}
      <UserSidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onLogout={onLogout}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {userName}
            </p>
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
            {/* Avatar with real initials */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-[#161b22] shadow-lg flex items-center justify-center text-sm font-bold">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Top Row: Status Cards */}
          <BookingStatusCards
            activeCount={stats.activeBookings}
            attendedCount={stats.attendedEvents}
            upcomingCount={stats.upcomingCount}
          />

          {/* Middle Section: Upcoming Bookings & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
            <div className="lg:col-span-2 h-full">
              <UpcomingBookingsCard onEventClick={handleNavigateToBookings} />
            </div>
            <div className="lg:col-span-1 h-full">
              <UserCalendarCard />
            </div>
          </div>

          {/* Bottom Section: Recent Invitations */}
          <div className="w-full pb-8">
            <RecentInvitationsCard onBookEvent={handleNavigateToBookings} />
          </div>
        </div>
      </main>
    </div>
  )
}
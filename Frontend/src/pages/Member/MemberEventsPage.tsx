import { useState, useEffect } from 'react'
import { Loader2, Bell, ChevronDown, User, LogOut, Search, X } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'

interface Event {
  id: number
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  poster_url: string
}

interface Notification {
  id: number
  title: string
  message: string
  type: string
  task_id: number
  created_at: string
  is_read: number | boolean
}

export function MemberEventsPage({ onLogout }: { onLogout: () => void }) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchData = async () => {
    try {
      const [eventsRes, notifRes] = await Promise.all([
        fetch('http://localhost:3000/api/events', { headers }),
        fetch('http://localhost:3000/api/notifications', { headers }),
      ])

      if (eventsRes.status === 401 || notifRes.status === 401) {
        onLogout()
        return
      }

      if (eventsRes.ok) {
        const allEvents = await eventsRes.json()
        // Sort by date, future events first
        const sorted = allEvents.sort((a: Event, b: Event) => 
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
        setEvents(sorted)
        setFilteredEvents(sorted)
      }
      if (notifRes.ok) setNotifications(await notifRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchTerm, events])

  const unreadNotifications = notifications.filter(n => n.is_read === 0)

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, { 
        method: 'PUT', 
        headers 
      })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('http://localhost:3000/api/notifications/read-all', { 
        method: 'PUT', 
        headers 
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }
  
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date)
    const today = new Date()
    return eventDate >= today
  }).length

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        {/* Header Section */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Events</h1>
            <p className="text-gray-400 mt-1">Discover and explore upcoming events</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-[#161b22] border border-gray-800 hover:border-[#4fd1c5]/50 rounded-xl transition-all shadow-lg group"
            >
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#4fd1c5]" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-[#0f1419]">
                  {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-800 bg-[#161b22] hover:border-gray-700 transition-all shadow-lg"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2d5f5d] to-[#1a3a38] flex items-center justify-center text-white font-bold shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <p className="text-sm font-bold text-white leading-none">{user?.name || 'Member'}</p>
                  <p className="text-[10px] text-[#4fd1c5] font-medium uppercase tracking-wider mt-1">
                    {user?.role?.replace('_', ' ') || 'MEMBER'}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                    <User size={14} /> Profile Settings
                  </button>
                  <div className="h-px bg-gray-800 my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-24 right-8 w-96 bg-[#161b22] border border-[#4fd1c5]/20 rounded-xl shadow-2xl z-40 max-h-[500px] overflow-y-auto animate-in slide-in-from-right-4 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Notifications <span className="text-xs bg-[#4fd1c5]/10 text-[#4fd1c5] px-2 py-0.5 rounded-full">{unreadNotifications.length} New</span>
                </h3>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#4fd1c5] hover:text-[#4fd1c5]/80 transition-colors font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity.</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-lg border transition-colors ${notif.is_read ? 'bg-transparent border-gray-800/50' : 'bg-[#4fd1c5]/5 border-[#4fd1c5]/20'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        </div>
                        {notif.is_read === 0 && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="flex-shrink-0 text-[10px] text-[#4fd1c5] hover:text-white bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/30 px-3 py-1.5 rounded-md transition-all font-semibold whitespace-nowrap"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#4fd1c5]" />
            <p className="text-gray-500 animate-pulse font-medium">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-[#4fd1c5] mt-2">{events.length}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{upcomingEvents}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-[#4fd1c5] outline-none transition-colors"
              />
            </div>

            {/* Events Grid */}
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No events found</p>
                  <p className="text-gray-600 text-sm mt-2">Try adjusting your search</p>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-[#161b22]/50 border border-gray-800 rounded-xl overflow-hidden hover:border-[#4fd1c5]/50 transition-all text-left hover:shadow-lg hover:shadow-[#4fd1c5]/20 group"
                  >
                    <div className="flex gap-6 p-6">
                      {event.poster_url && (
                        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={event.poster_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-[#4fd1c5] transition-colors">{event.title}</h3>
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm mt-4">
                          <div className="text-gray-400">
                            📅 <span className="text-gray-200">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="text-gray-400">
                            🕐 <span className="text-gray-200">{event.event_time}</span>
                          </div>
                          <div className="text-gray-400">
                            📍 <span className="text-gray-200">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white pr-4">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Description</p>
                <p className="text-gray-200">{selectedEvent.description}</p>
              </div>

              {selectedEvent.poster_url && (
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-2">Poster</p>
                  <img
                    src={selectedEvent.poster_url}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-2">📅 Date</p>
                  <p className="text-gray-200">{new Date(selectedEvent.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-2">🕐 Time</p>
                  <p className="text-gray-200">{selectedEvent.event_time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">📍 Location</p>
                <p className="text-gray-200">{selectedEvent.location}</p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/20 text-[#4fd1c5] font-semibold py-2 rounded-lg transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

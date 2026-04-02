import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Search, Plus, CalendarDays, Clock, Archive } from 'lucide-react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Button } from '../../../components/ui/Button'
import { EventCard } from '../../../components/events/EventCard'

interface EventManagementProps {
  onLogout: () => void;
}

function computeStatus(event_date: string, event_time: string): 'Upcoming' | 'Live' | 'Past' {
  const now = new Date()

  const eventDate = new Date(event_date)
  const year = eventDate.getFullYear()
  const month = String(eventDate.getMonth() + 1).padStart(2, '0')
  const day = String(eventDate.getDate()).padStart(2, '0')
  const datePart = `${year}-${month}-${day}`

  const timePart = event_time.slice(0, 5)
  const eventDateTime = new Date(`${datePart}T${timePart}:00`)

  const diffMs = eventDateTime.getTime() - now.getTime()
  const diffMins = diffMs / (1000 * 60)

  if (diffMs < 0 && Math.abs(diffMins) > 60) return 'Past'
  if (Math.abs(diffMins) <= 60) return 'Live'
  return 'Upcoming'
}

export function EventManagement({ onLogout }: EventManagementProps) {
  const navigate = useNavigate()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      console.warn('No token found, logging out')
      onLogout()
      return
    }
    
    const fetchEvents = async () => {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      try {
        const response = await axios.get('http://localhost:3000/api/events', { headers })
        setEvents(response.data || [])
        setLoading(false)
      } catch (error: any) {
        console.error("Error fetching events:", error)
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          console.warn('401 Unauthorized - token may be expired')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          onLogout()
          return
        }
        
        // Handle network errors
        if (error.message === 'Network Error') {
          console.error('Network error: Backend may not be running')
        }
        
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [token, onLogout])

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEvents = filteredEvents.length
  const upcomingEvents = filteredEvents.filter(e => computeStatus(e.event_date, e.event_time) === 'Upcoming').length
  const liveEvents = filteredEvents.filter(e => computeStatus(e.event_date, e.event_time) === 'Live').length
  const pastEvents = filteredEvents.filter(e => computeStatus(e.event_date, e.event_time) === 'Past').length

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Event Management</h1>
            <p className="text-sm text-[#9ca3af]">Create, manage, and track all your events.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161b22] border border-[#30363d] text-white text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>
            <Button onClick={() => navigate('/events/create')}><Plus className="w-4 h-4 mr-2" />Create New Event</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={CalendarDays} count={totalEvents} label="Total Events" />
          <StatCard icon={Clock} count={upcomingEvents + liveEvents} label="Upcoming & Live" />
          <StatCard icon={Archive} count={pastEvents} label="Past Events" />
        </div>

        {loading ? (
          <div className="text-center text-[#9ca3af] py-20">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-[#9ca3af] py-20">No events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                event_date={event.event_date}
                event_time={event.event_time}
                description={event.description}
                poster_url={event.poster_url}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, count, label }: { icon: any, count: number, label: string }) {
  return (
    <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#4fd1c5]" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-none mb-1">{count}</div>
        <div className="text-xs text-[#9ca3af]">{label}</div>
      </div>
    </div>
  )
}
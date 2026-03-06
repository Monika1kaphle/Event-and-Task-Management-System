import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, CalendarDays, Clock, Archive, Calendar } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { EventCard } from '../components/events/EventCard'

interface EventManagementProps {
  onLogout: () => void;
}

export function EventManagement({ onLogout }: EventManagementProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEmpty, setShowEmpty] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    axios.get('http://localhost:3000/api/events')
      .then(response => {
        setEvents(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching events:", error)
        setLoading(false)
      })
  }, [])

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const displayEvents = showEmpty ? [] : filteredEvents
  
  // Calculate stats for the cards
  const totalEvents = displayEvents.length
  const upcomingEvents = displayEvents.filter((e) => e.status === 'Upcoming' || e.status === 'Live').length
  const pastEvents = displayEvents.filter((e) => e.status === 'Past').length

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
            <Button><Plus className="w-4 h-4 mr-2" />Create New Event</Button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={CalendarDays} count={totalEvents} label="Total Events" />
          <StatCard icon={Clock} count={upcomingEvents} label="Upcoming & Live" />
          <StatCard icon={Archive} count={pastEvents} label="Past Events" />
        </div>

        {/* Dynamic Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <EventCard 
              key={event.id}
              id={event.id}
              title={event.title}
              // Map database columns to the props expected by your component
              event_date={new Date(event.event_date).toLocaleDateString()} 
              event_time={event.event_time}
              description={event.description}
              status={event.status || 'Upcoming'}
              // Ensure image path is complete
              poster_url={event.poster_url}
            />
          ))}
        </div>
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
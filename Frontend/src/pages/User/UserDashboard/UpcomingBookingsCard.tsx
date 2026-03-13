import React, { useState, useEffect } from 'react'
import { CalendarDays, Clock, MoreVertical } from 'lucide-react'

interface UpcomingBookingsCardProps {
  onEventClick?: (eventId: number) => void
}

export function UpcomingBookingsCard({ onEventClick }: UpcomingBookingsCardProps) {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Live' | 'Past'>('Upcoming')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const gradients = [
    'from-blue-500 to-purple-600',
    'from-teal-400 to-cyan-600',
    'from-amber-400 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-emerald-400 to-green-600',
  ]

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/client/events', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (err) {
        console.error('Failed to fetch events', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const categorized = events.map((e, i) => {
    // Combine date + time into one Date object for accurate comparison
    const eventDateTime = new Date(`${e.event_date.split('T')[0]}T${e.event_time}`)
    const now = new Date()
    const diffMs = eventDateTime.getTime() - now.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)

    let status: 'Upcoming' | 'Live' | 'Past'
    if (diffMs < 0) status = 'Past'
    else if (diffHrs <= 2) status = 'Live'
    else status = 'Upcoming'

    return { ...e, status, gradient: gradients[i % gradients.length] }
  })

  const filteredEvents = categorized.filter((e) => e.status === activeTab)

  return (
    <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Events</h3>
        </div>
        <div className="flex space-x-1 bg-[#0f1419] p-1 rounded-lg border border-gray-800 self-start sm:self-auto">
          {(['Upcoming', 'Live', 'Past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-[#2d5f5d] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
            No {activeTab.toLowerCase()} events found.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event.id)}
              className="rounded-xl bg-[#0f1419] border border-gray-800/50 hover:border-gray-600 transition-all cursor-pointer group overflow-hidden flex flex-col"
            >
              {/* Poster — shows image if exists, gradient fallback if not */}
              <div className={`h-32 w-full relative flex-shrink-0 bg-gradient-to-br ${event.gradient}`}>
                {event.poster_url && (
                  <img
                    src={`http://localhost:3000/${event.poster_url}`}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken image, shows gradient underneath
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <button className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-colors z-10">
                  <MoreVertical className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-3">
                  <span
                    className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${
                      event.status === 'Upcoming'
                        ? 'bg-[#2d5f5d]/20 text-[#4fd1c5]'
                        : event.status === 'Live'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {event.status.toUpperCase()}
                    {event.status === 'Live' && (
                      <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full ml-1.5 animate-pulse" />
                    )}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#4fd1c5] transition-colors line-clamp-1">
                  {event.title}
                </h4>

                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {event.event_time}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-auto line-clamp-2">
                  {event.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
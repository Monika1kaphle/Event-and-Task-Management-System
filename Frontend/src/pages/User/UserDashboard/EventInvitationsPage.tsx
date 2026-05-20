import React, { useState, useEffect } from 'react'
import { Mail, CalendarDays, Clock, MapPin, Users, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function EventInvitationsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'invited' | 'booked'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/client/events', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          // Sort by date
          const sorted = data.sort((a: any, b: any) => 
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
          )
          setEvents(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch events', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const getFilteredEvents = () => {
    if (filter === 'booked') return events.filter(e => e.isBooked)
    if (filter === 'invited') return events.filter(e => !e.isBooked)
    return events
  }

  const filteredEvents = getFilteredEvents()
  const upcomingCount = events.filter((e: any) => new Date(e.event_date) >= new Date()).length
  const pastCount = events.filter((e: any) => new Date(e.event_date) < new Date()).length

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#2d5f5d]/20 to-[#4fd1c5]/10 backdrop-blur-xl border border-[#4fd1c5]/30 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-lg bg-[#4fd1c5]/20 text-[#4fd1c5]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-white">Event Invitations</h1>
            </div>
            <p className="text-gray-300">You have been invited to the following events</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-2xl font-bold text-[#4fd1c5]">{upcomingCount}</p>
              <p className="text-xs text-gray-400">Upcoming</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{pastCount}</p>
              <p className="text-xs text-gray-400">Past</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-[#4fd1c5] text-[#0f1419]'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('invited')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            filter === 'invited'
              ? 'bg-[#4fd1c5] text-[#0f1419]'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
          }`}
        >
          Invitations
        </button>
        <button
          onClick={() => setFilter('booked')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            filter === 'booked'
              ? 'bg-[#4fd1c5] text-[#0f1419]'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
          }`}
        >
          Booked
        </button>
      </div>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#161b22] rounded-2xl border border-gray-800/50">
          <Mail className="h-16 w-16 text-gray-800 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-400 mb-1">No events found</p>
          <p className="text-sm text-gray-500">
            {filter === 'invited' && 'You have no pending invitations'}
            {filter === 'booked' && 'You have not booked any events'}
            {filter === 'all' && 'No events available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isUpcoming = new Date(event.event_date) >= new Date()
            const isBooked = event.isBooked

            return (
              <div
                key={event.id}
                className="group relative bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden hover:border-[#4fd1c5]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#4fd1c5]/10"
              >
                {/* POSTER */}
                {event.poster_url && (
                  <div className="relative h-48 bg-gradient-to-br from-[#2d5f5d]/20 to-[#4fd1c5]/10 overflow-hidden">
                    <img
                      src={`http://localhost:3000/${event.poster_url}`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                )}

                {/* CONTENT */}
                <div className="p-6 space-y-4">
                  {/* STATUS BADGE */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {isBooked && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4fd1c5]/20 text-[#4fd1c5]">
                          ✓ Booked
                        </span>
                      )}
                      {!isBooked && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                          You are invited
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TITLE */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
                  </div>

                  {/* EVENT DETAILS */}
                  <div className="space-y-2 text-sm text-gray-300 bg-[#0f1419]/50 p-4 rounded-lg border border-gray-800/50">
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="h-4 w-4 text-[#4fd1c5]" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-[#4fd1c5]" />
                      <span>{event.event_time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-[#4fd1c5]" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.max_capacity && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-[#4fd1c5]" />
                        <span>Max {event.max_capacity} attendees</span>
                      </div>
                    )}
                  </div>

                  {/* PRICE & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                    {event.price > 0 ? (
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="text-lg font-bold text-[#4fd1c5]">₹{event.price}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="text-lg font-bold text-[#4fd1c5]">Free</p>
                      </div>
                    )}
                    {!isBooked && (
                      <Button variant="primary" className="text-sm py-2 px-4 h-auto">
                        Book Now
                      </Button>
                    )}
                    {isBooked && (
                      <div className="text-sm text-[#4fd1c5] font-semibold">Already Booked</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

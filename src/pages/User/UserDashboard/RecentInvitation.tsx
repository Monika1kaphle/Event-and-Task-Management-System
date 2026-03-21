import React, { useState, useEffect } from 'react'
import { Mail, Users, CalendarDays, Clock, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface RecentInvitationsCardProps {
  onBookEvent?: () => void
}

export function RecentInvitationsCard({ onBookEvent }: RecentInvitationsCardProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/client/events', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          // Show only upcoming, max 3
          const upcoming = data
            .filter((e: any) => new Date(e.event_date) >= new Date())
            .slice(0, 3)
          setEvents(upcoming)
        }
      } catch (err) {
        console.error('Failed to fetch invitations', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleBook = async (eventId: number) => {
    setBookingId(eventId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/client/book-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Booking successful!')
        onBookEvent?.()
      } else {
        alert(data.error || 'Booking failed')
      }
    } catch {
      alert('Could not connect to server')
    } finally {
      setBookingId(null)
    }
  }

  return (
    <div className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Recent Event Invitations</h3>
        </div>
        <button className="text-sm text-[#2d5f5d] hover:text-[#4fd1c5] font-medium transition-colors">
          View All Invitations
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No upcoming events available.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-xl bg-[#0f1419]/50 border border-gray-800/50 flex flex-col h-full hover:border-gray-600 transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-base font-bold text-white mb-2">{event.title}</h4>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-xs text-gray-400 mb-6 bg-[#161b22] p-3 rounded-lg border border-gray-800/50">
                  <div className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-2 text-gray-500" />
                    <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-2 text-gray-500" />
                    <span>{event.event_time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_capacity && (
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      <span>{event.max_capacity} attendees max</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  variant="primary"
                  className="w-full py-2.5 h-auto text-sm font-semibold"
                  onClick={() => handleBook(event.id)}
                  disabled={event.isBooked || bookingId === event.id}
                >
                  {event.isBooked ? '✓ Already Booked' : bookingId === event.id ? 'Booking...' : 'Book the Event'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
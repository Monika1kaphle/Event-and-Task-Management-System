import React, { useState, useEffect } from 'react'
import { Mail, Users, CalendarDays, Clock, MapPin, Star } from 'lucide-react'

interface RecentInvitationsCardProps {
  onBookEvent?: () => void
}

export function RecentInvitationsCard({ onBookEvent }: RecentInvitationsCardProps) {
  const [events, setEvents] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Fetch events
        const eventResponse = await fetch('http://localhost:3000/api/client/events', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (eventResponse.ok) {
          const data = await eventResponse.json()
          // Show only upcoming, max 3
          const upcoming = data
            .filter((e: any) => new Date(e.event_date) >= new Date())
            .slice(0, 3)
          setEvents(upcoming)
        }

        // Fetch notifications for new events
        const notifResponse = await fetch('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (notifResponse.ok) {
          const notifData = await notifResponse.json()
          // Filter for NEW_EVENT notifications
          const newEventNotifs = notifData.filter((n: any) => n.type === 'NEW_EVENT')
          setNotifications(newEventNotifs)
        }
      } catch (err) {
        console.error('Failed to fetch data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const latestNewEvent = notifications.length > 0 ? notifications[0] : null

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

      {/* NEW EVENT NOTIFICATION BANNER */}
      {latestNewEvent && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#2d5f5d]/20 to-[#4fd1c5]/10 border border-[#4fd1c5]/30 animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-[#4fd1c5]/20 text-[#4fd1c5] mt-0.5">
              <Star className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#4fd1c5] mb-1">New Event</p>
              <p className="text-sm text-gray-300 break-words">{latestNewEvent.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(latestNewEvent.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
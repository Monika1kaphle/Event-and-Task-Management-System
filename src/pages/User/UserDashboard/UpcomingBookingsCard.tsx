import React, { useState, useEffect } from 'react'
import { CalendarDays, Clock, MoreVertical, MapPin, Users, BookOpen, X, CreditCard, Smartphone } from 'lucide-react'

interface UpcomingBookingsCardProps {
  onEventClick?: (eventId: number) => void
}

// ─── Payment Modal ───────────────────────────────────────────────────────────
function PaymentModal({
  event,
  onClose,
  onSuccess,
}: {
  event: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<'khalti' | 'esewa' | null>(null)
  const [loading, setLoading] = useState(false)
  const amount = Number(event.price) || 0

  const handleFreeBooking = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/client/book-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: event.id }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || 'Booking failed')
      }
    } catch {
      alert('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!method) return alert('Please select a payment method')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      if (method === 'khalti') {
        const res = await fetch('http://localhost:3000/api/payment/khalti/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.id,
            amount: amount * 100, // paisa
            eventName: event.title,
          }),
        })
        const data = await res.json()
        if (res.ok && data.payment_url) {
          window.location.href = data.payment_url
        } else {
          alert(data.error || 'Khalti payment failed')
        }

      } else if (method === 'esewa') {
        const res = await fetch('http://localhost:3000/api/payment/esewa/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event.id,
            amount,
            eventName: event.title,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = 'https://rc-web.esewa.com.np/api/epay/main/v2/form'
          Object.entries(data.fields).forEach(([key, value]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value as string
            form.appendChild(input)
          })
          document.body.appendChild(form)
          form.submit()
        } else {
          alert(data.error || 'eSewa payment failed')
        }
      }
    } catch {
      alert('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Complete Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event Summary */}
        <div className="bg-[#0f1419] rounded-xl p-4 mb-6 border border-gray-800">
          {event.poster_url && (
            <img
              src={`http://localhost:3000${event.poster_url}`}
              alt={event.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <p className="text-gray-400 text-xs mb-1">Booking for</p>
          <h3 className="text-white font-bold text-base mb-3">{event.title}</h3>
          <div className="flex flex-col gap-1.5 text-sm text-gray-400 mb-3">
            <div className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-2 text-gray-500" />
              {new Date(event.event_date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-2 text-gray-500" />
              {event.event_time}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-2 text-gray-500" />
                {event.location}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <span className="text-gray-400 text-sm">Total Amount</span>
            <span className="text-[#4fd1c5] font-bold text-xl">
              {amount === 0 ? 'FREE' : `Rs. ${amount}`}
            </span>
          </div>
        </div>

        {/* Free Event */}
        {amount === 0 ? (
          <button
            onClick={handleFreeBooking}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2d5f5d] hover:bg-[#3d7a77] text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Confirming...' : '✓ Confirm Free Booking'}
          </button>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-3 font-medium">Select payment method</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Khalti */}
              <button
                onClick={() => setMethod('khalti')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'khalti'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-[#0f1419] hover:border-gray-600'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">Khalti</span>
                <span className="text-gray-500 text-xs">Digital Wallet</span>
                {method === 'khalti' && (
                  <span className="text-purple-400 text-xs font-bold">✓ Selected</span>
                )}
              </button>

              {/* eSewa */}
              <button
                onClick={() => setMethod('esewa')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  method === 'esewa'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 bg-[#0f1419] hover:border-gray-600'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">eSewa</span>
                <span className="text-gray-500 text-xs">Digital Wallet</span>
                {method === 'esewa' && (
                  <span className="text-green-400 text-xs font-bold">✓ Selected</span>
                )}
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={!method || loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                method && !loading
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={method ? { boxShadow: '0 0 20px rgba(59,130,246,0.4)' } : {}}
            >
              {loading
                ? 'Processing payment...'
                : method
                ? `Pay Rs. ${amount} with ${method === 'khalti' ? 'Khalti' : 'eSewa'}`
                : 'Select a payment method'}
            </button>

            <p className="text-center text-xs text-gray-600 mt-3">
              Secured by Khalti & eSewa payment gateways
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export function UpcomingBookingsCard({ onEventClick }: UpcomingBookingsCardProps) {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Live' | 'Past'>('Upcoming')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

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

  const handleBookNow = (e: React.MouseEvent, event: any) => {
    e.stopPropagation()
    setSelectedEvent(event)
  }

  const handleBookingSuccess = () => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === selectedEvent.id ? { ...ev, isBooked: true } : ev))
    )
    setSelectedEvent(null)
    onEventClick?.(selectedEvent.id)
  }

  const categorized = events.map((e, i) => {
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
    <>
      <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-2 pr-1">
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
                  {/* Poster */}
                  <div className={`aspect-square w-full relative flex-shrink-0 bg-gradient-to-br ${event.gradient}`}>
                    {event.poster_url && (
                      <img
                        src={`http://localhost:3000${event.poster_url}`}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    {/* Price badge */}
                    {event.price != null && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-white z-10">
                        {Number(event.price) === 0 ? 'FREE' : `Rs. ${event.price}`}
                      </div>
                    )}
                    {/* Status badge */}
                    <div className={`absolute bottom-2 left-2 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full z-10 ${
                      event.status === 'Upcoming'
                        ? 'bg-[#2d5f5d]/80 text-[#4fd1c5]'
                        : event.status === 'Live'
                        ? 'bg-red-500/80 text-white'
                        : 'bg-black/60 text-gray-400'
                    }`}>
                      {event.status.toUpperCase()}
                      {event.status === 'Live' && (
                        <span className="inline-block w-1 h-1 bg-white rounded-full ml-1 animate-pulse" />
                      )}
                    </div>
                    <button className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-colors z-10">
                      <MoreVertical className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#4fd1c5] transition-colors line-clamp-1">
                      {event.title}
                    </h4>

                    <div className="flex flex-col gap-1 text-sm text-gray-400 mb-2">
                      <div className="flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        {event.event_time}
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-400 mb-1.5">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-500" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    {event.max_capacity && (
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-500" />
                        <span>{event.max_capacity} seats</span>
                      </div>
                    )}

                    {/* Book Now — Upcoming only */}
                    {event.status === 'Upcoming' && (
                      <button
                        onClick={(e) => handleBookNow(e, event)}
                        disabled={event.isBooked}
                        className={`mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                          ${event.isBooked
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/40 hover:border-blue-400/70 hover:text-blue-300'
                          }
                        `}
                        style={!event.isBooked ? {
                          boxShadow: '0 0 14px rgba(59,130,246,0.3), 0 0 4px rgba(59,130,246,0.15)'
                        } : {}}
                      >
                        <BookOpen className="h-4 w-4" />
                        {event.isBooked ? '✓ Already Booked' : 'Book Now'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedEvent && (
        <PaymentModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  )
}
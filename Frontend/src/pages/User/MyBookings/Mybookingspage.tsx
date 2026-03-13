import React, { useState, useEffect } from 'react'
import {
  CalendarDays, Clock, MapPin, Users, Ticket,
  CheckCircle2, XCircle, Timer, Search,
  Download, Eye, TrendingUp,
} from 'lucide-react'

interface Booking {
  booking_id: number
  booking_date: string
  event_id: number
  title: string
  event_date: string
  event_time: string
  location: string | null
  max_capacity: number | null
  price: number
  poster_url: string | null
  status: string
  description: string | null
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Past'>('All')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/client/my-bookings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setBookings(data)
        }
      } catch (err) {
        console.error('Failed to fetch bookings', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const getEventStatus = (booking: Booking) => {
    const eventDateTime = new Date(`${booking.event_date.split('T')[0]}T${booking.event_time}`)
    const now = new Date()
    const diffMs = eventDateTime.getTime() - now.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)
    if (diffMs < 0) return 'Past'
    if (diffHrs <= 2) return 'Live'
    return 'Upcoming'
  }

  const filtered = bookings
    .filter((b) => {
      const status = getEventStatus(b)
      if (filter === 'Upcoming') return status === 'Upcoming' || status === 'Live'
      if (filter === 'Past') return status === 'Past'
      return true
    })
    .filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.location || '').toLowerCase().includes(search.toLowerCase())
    )

  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.price || 0), 0)
  const upcomingCount = bookings.filter((b) => getEventStatus(b) === 'Upcoming').length
  const pastCount = bookings.filter((b) => getEventStatus(b) === 'Past').length

  const gradients = [
    'from-blue-500 to-purple-600',
    'from-teal-400 to-cyan-600',
    'from-amber-400 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-emerald-400 to-green-600',
  ]

  const statusBadge = (status: string) => {
    if (status === 'Upcoming') return 'bg-[#2d5f5d]/80 text-[#4fd1c5] border border-[#4fd1c5]/20'
    if (status === 'Live') return 'bg-red-500/80 text-white border border-red-400/30'
    return 'bg-gray-800/80 text-gray-400 border border-gray-700/30'
  }

  return (
    <div className="p-8 text-white min-h-screen">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: Ticket, color: 'text-[#4fd1c5]', bg: 'bg-[#4fd1c5]/10', border: 'border-[#4fd1c5]/20' },
          { label: 'Upcoming', value: upcomingCount, icon: Timer, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
          { label: 'Attended', value: pastCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
          {
            label: 'Total Spent',
            value: totalSpent === 0 ? 'Free' : `Rs. ${totalSpent}`,
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/20'
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className={`bg-[#161b22]/80 border ${stat.border} rounded-2xl p-5 flex items-center space-x-4 hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs font-medium truncate">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by event name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#2d5f5d] transition-colors"
          />
        </div>
        <div className="flex space-x-1 bg-[#161b22] border border-gray-800 p-1 rounded-xl flex-shrink-0">
          {(['All', 'Upcoming', 'Past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === tab
                  ? 'bg-[#2d5f5d] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-[#4fd1c5] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm">Loading your bookings...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-20 w-20 rounded-full bg-gray-800/50 flex items-center justify-center">
            <Ticket className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-gray-400">No bookings found</p>
          <p className="text-sm text-gray-600">
            {search ? 'Try a different search term' : 'You have no bookings yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {filtered.map((booking, i) => {
            const eventStatus = getEventStatus(booking)
            const gradient = gradients[i % gradients.length]
            const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
            const isPaid = Number(booking.price || 0) > 0

            return (
              <div
                key={booking.booking_id}
                className="bg-[#161b22]/80 border border-gray-800/50 rounded-2xl overflow-hidden hover:border-[#2d5f5d]/50 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row">

                  {/* Poster */}
                  <div className={`md:w-44 h-44 md:h-auto flex-shrink-0 bg-gradient-to-br ${gradient} relative`}>
                    {booking.poster_url && (
                      <img
                        src={`http://localhost:3000${booking.poster_url}`}
                        alt={booking.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Status badge */}
                    <div className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm ${statusBadge(eventStatus)}`}>
                      {eventStatus.toUpperCase()}
                      {eventStatus === 'Live' && (
                        <span className="inline-block w-1.5 h-1.5 bg-white rounded-full ml-1 animate-pulse" />
                      )}
                    </div>
                    {/* Booked badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400">BOOKED</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 p-5 flex flex-col md:flex-row md:items-stretch gap-4">

                    {/* Event Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#4fd1c5] transition-colors truncate">
                        {booking.title}
                      </h3>
                      {booking.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-1 overflow-hidden">
                          {booking.description}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(booking.event_date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span>{booking.event_time}</span>
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                        )}
                        {booking.max_capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                            <span>{booking.max_capacity} seats max</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px bg-gray-800/80 flex-shrink-0" />

                    {/* Transaction Panel */}
                    <div className="md:w-52 flex-shrink-0 flex flex-col justify-between">
                      <div className="bg-[#0f1419] rounded-xl p-4 border border-gray-800/60 mb-3 flex-1">

                        {/* Transaction ID */}
                        <div className="mb-3">
                          <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest mb-1">
                            Transaction ID
                          </p>
                          <p className="text-white text-sm font-mono font-bold">
                            #BK-{String(booking.booking_id).padStart(6, '0')}
                          </p>
                        </div>

                        {/* Booked On */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest mb-1">
                            Booked On
                          </p>
                          <p className="text-gray-300 text-xs leading-relaxed">{bookingDate}</p>
                        </div>

                        {/* Amount */}
                        <div className="pt-3 border-t border-gray-800">
                          <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
                            Amount Paid
                          </p>
                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <>
                                <div className="w-2 h-2 rounded-full bg-[#4fd1c5] flex-shrink-0" />
                                <span className="text-[#4fd1c5] font-bold text-xl">
                                  Rs. {booking.price}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                <span className="text-emerald-400 font-bold text-xl">FREE</span>
                              </>
                            )}
                          </div>
                          {isPaid && (
                            <p className="text-gray-600 text-[10px] mt-1">Paid via eSewa / Khalti</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-[#2d5f5d]/20 text-[#4fd1c5] border border-[#2d5f5d]/40 hover:bg-[#2d5f5d]/40 hover:border-[#4fd1c5]/40 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </button>
                        <button className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-800 transition-all">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal poster */}
            <div className={`h-52 w-full bg-gradient-to-br ${gradients[0]} relative`}>
              {selectedBooking.poster_url && (
                <img
                  src={`http://localhost:3000${selectedBooking.poster_url}`}
                  alt={selectedBooking.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-12">
                <div className={`inline-flex text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mb-2 ${statusBadge(getEventStatus(selectedBooking))}`}>
                  {getEventStatus(selectedBooking).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white truncate">{selectedBooking.title}</h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Booking confirmed banner */}
              <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">Booking Confirmed</p>
                  <p className="text-emerald-600/80 text-xs mt-0.5">
                    {new Date(selectedBooking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Event details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: CalendarDays,
                    label: 'Event Date',
                    value: new Date(selectedBooking.event_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    }),
                  },
                  { icon: Clock, label: 'Event Time', value: selectedBooking.event_time },
                  { icon: MapPin, label: 'Location', value: selectedBooking.location || 'TBA' },
                  {
                    icon: Users,
                    label: 'Capacity',
                    value: selectedBooking.max_capacity
                      ? `${selectedBooking.max_capacity} seats`
                      : 'Unlimited',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#0f1419] rounded-xl p-3.5 border border-gray-800/60">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
                        {label}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Transaction info */}
              <div className="bg-[#0f1419] rounded-xl p-4 border border-gray-800/60">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                    Transaction ID
                  </span>
                  <span className="text-white font-mono text-sm font-bold">
                    #BK-{String(selectedBooking.booking_id).padStart(6, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">Amount Paid</span>
                  <span className={`text-2xl font-bold ${
                    Number(selectedBooking.price || 0) === 0 ? 'text-emerald-400' : 'text-[#4fd1c5]'
                  }`}>
                    {Number(selectedBooking.price || 0) === 0
                      ? 'FREE'
                      : `Rs. ${selectedBooking.price}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 rounded-xl bg-[#2d5f5d] hover:bg-[#3d7a77] text-white font-semibold text-sm transition-colors"
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
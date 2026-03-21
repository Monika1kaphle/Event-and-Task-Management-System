import React from 'react'
import { CalendarCheck, CheckCircle2, CalendarClock } from 'lucide-react'

interface BookingStatusCardsProps {
  activeCount: number
  attendedCount: number
  upcomingCount: number
}

export function BookingStatusCards({ activeCount, attendedCount, upcomingCount}: BookingStatusCardsProps) {
  const stats = [
    {
      title: 'Active Bookings',
      count: activeCount,
      icon: CalendarCheck,
      color: 'text-[#4fd1c5]',
      bgColor: 'bg-[#4fd1c5]/10',
      glow: 'drop-shadow(0 0 12px rgba(79,209,197,0.5))',
    },
    {
      title: 'Attended Events',
      count: attendedCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      glow: 'drop-shadow(0 0 12px rgba(52,211,153,0.5))',
    },
    {
      title: 'Upcoming Events',
      count: upcomingCount,
      icon: CalendarClock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      glow: 'drop-shadow(0 0 12px rgba(251,191,36,0.5))',
    },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex items-center space-x-4 group"
          >
            <div
              className={`h-14 w-14 rounded-full ${stat.bgColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300`}
            >
              <Icon
                className={`h-7 w-7 ${stat.color}`}
                style={{
                  filter: stat.glow,
                }}
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <h4 className="text-3xl font-bold text-white mt-1">
                {stat.count}
              </h4>
            </div>
          </div>
        )
      })}
    </div>
  )
}

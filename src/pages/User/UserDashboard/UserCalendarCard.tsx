import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export function UserCalendarCard() {
  const [eventDates, setEventDates] = useState<number[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    const fetchEventDates = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/client/events', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const dates = data
            .filter((e: any) => {
              const d = new Date(e.event_date)
              return (
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear()
              )
            })
            .map((e: any) => new Date(e.event_date).getDate())
          setEventDates(dates)
        }
      } catch (err) {
        console.error('Failed to fetch calendar events', err)
      }
    }
    fetchEventDates()
  }, [currentDate])

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    // Correct first day of month (0=Sun, 6=Sat)
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const arr: any[] = []

    // Empty padding cells before day 1
    for (let i = 0; i < firstDayOfMonth; i++) {
      arr.push({ day: null, isCurrentMonth: false })
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({
        day: i,
        isCurrentMonth: true,
        hasEvent: eventDates.includes(i),
        isToday:
          i === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear(),
      })
    }

    return arr
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">My Calendar</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-300 w-28 text-center">
            {currentMonth} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-y-1 flex-1">
        {calendarDays.map((date, index) => (
          <div
            key={index}
            className={`
              flex flex-col items-center justify-center rounded-lg text-xs relative
              transition-all aspect-square
              ${
                date.isCurrentMonth
                  ? 'hover:bg-[#2d5f5d]/10 text-gray-300 hover:text-white cursor-pointer'
                  : 'text-transparent pointer-events-none'
              }
              ${
                date.isToday
                  ? 'ring-1 ring-[#4fd1c5] bg-[#2d5f5d]/10 !text-white font-bold'
                  : ''
              }
            `}
          >
            <span>{date.day}</span>
            {date.hasEvent && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#4fd1c5]" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
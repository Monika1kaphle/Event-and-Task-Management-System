import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarCard() {
  // Use state to track the month/year the user is viewing
  const [viewDate, setViewDate] = useState(new Date())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time for accurate comparison

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  // 1. Get total days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // 2. Get the day of the week the month starts on (0=Sun, 1=Mon, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyStartDays = Array.from({ length: firstDayOfMonth })

  const monthName = viewDate.toLocaleString('default', { month: 'long' })

  // Navigation handlers
  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1))

  return (
    <div className="h-full bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Calendar View</h3>
        <div className="flex items-center space-x-4 text-gray-400">
          <ChevronLeft 
            className="h-5 w-5 cursor-pointer hover:text-white" 
            onClick={prevMonth}
          />
          <span className="font-medium text-white text-base">
            {monthName} {currentYear}
          </span>
          <ChevronRight 
            className="h-5 w-5 cursor-pointer hover:text-white" 
            onClick={nextMonth}
          />
        </div>
      </div>

      {/* Week Days Header */}
      <div 
        className="mb-2 text-center"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div 
        className="flex-1 w-full"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          alignContent: 'space-evenly', 
          gap: '0.5rem' 
        }}
      >
        {emptyStartDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const dateObj = new Date(currentYear, currentMonth, day)
          const isToday = dateObj.getTime() === today.getTime()
          const isPast = dateObj < today
          
          // Example event logic
          const hasEvent = [5, 12, 18, 24, 28].includes(day) && !isPast

          return (
            <div 
              key={day} 
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all duration-200
                ${isPast 
                  ? 'text-gray-600 cursor-not-allowed opacity-40' 
                  : 'text-gray-300 hover:bg-[#1f2937] hover:scale-105 cursor-pointer'}
                ${isToday ? 'bg-[#2d5f5d]/20 text-[#2d5f5d] scale-110 shadow-lg shadow-[#2d5f5d]/10' : ''}
              `}
            >
              <span className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>
                {day}
              </span>
              
              {hasEvent && (
                 <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#2d5f5d] shadow-[0_0_6px_#2d5f5d]"></span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
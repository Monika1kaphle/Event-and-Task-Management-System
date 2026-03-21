import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarCard() {
  const [viewDate, setViewDate] = useState(new Date())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyStartDays = Array.from({ length: firstDayOfMonth })

  const monthName = viewDate.toLocaleString('default', { month: 'long' })

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1))

  return (
    <div className="h-full bg-[#161b22] border border-gray-800 rounded-2xl p-5 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Calendar View</h3>
        <div className="flex items-center space-x-3 text-gray-400">
          <ChevronLeft 
            className="h-4 w-4 cursor-pointer hover:text-white transition-colors" 
            onClick={prevMonth}
          />
          <span className="font-medium text-white text-sm whitespace-nowrap">
            {monthName} {currentYear}
          </span>
          <ChevronRight 
            className="h-4 w-4 cursor-pointer hover:text-white transition-colors" 
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
          <div key={day} className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div 
        className="w-full"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          alignContent: 'start', 
          gap: '4px' 
        }}
      >
        {emptyStartDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateObj = new Date(currentYear, currentMonth, day)
          const isToday = dateObj.getTime() === today.getTime()
          const isPast = dateObj < today
          
          const hasEvent = [5, 12, 18, 24, 28].includes(day) && !isPast

          return (
            <div 
              key={day} 
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all duration-200
                ${isPast 
                  ? 'text-gray-600 opacity-40' 
                  : 'text-gray-300 hover:bg-[#1f2937] cursor-pointer'}
                ${isToday ? 'bg-[#2d5f5d]/20 text-[#4fd1c5] ring-1 ring-[#2d5f5d]/50' : ''}
              `}
            >
              <span className={`text-sm ${isToday ? 'font-bold' : 'font-medium'}`}>
                {day}
              </span>
              
              {hasEvent && (
                 <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#4fd1c5] shadow-[0_0_6px_#4fd1c5]"></span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
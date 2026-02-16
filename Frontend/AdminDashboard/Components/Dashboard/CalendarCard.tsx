import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarCard() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const emptyStartDays = Array.from({ length: 3 }) // Starts on Thursday

  return (
    <div className="h-full bg-[#161b22] border border-gray-800 rounded-2xl p-6 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Calendar View</h3>
        <div className="flex items-center space-x-4 text-gray-400">
          <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-white" />
          <span className="font-medium text-white text-base">January 2026</span>
          <ChevronRight className="h-5 w-5 cursor-pointer hover:text-white" />
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
          const hasEvent = [5, 12, 18, 24, 28].includes(day)
          const isToday = day === 28

          return (
            <div 
              key={day} 
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl relative group cursor-pointer transition-all duration-200
                ${isToday ? 'bg-[#2d5f5d]/20 text-[#2d5f5d] scale-110 shadow-lg shadow-[#2d5f5d]/10' : 'text-gray-300 hover:bg-[#1f2937] hover:scale-105'}
              `}
            >
              <span className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>{day}</span>
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
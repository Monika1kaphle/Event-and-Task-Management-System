import { useEffect, useState, useRef } from 'react'
import { MoreVertical, Pencil, Trash2, CalendarDays, Clock, Calendar } from 'lucide-react'

interface EventCardProps {
  id: number
  title: string
  event_date: string // Updated from 'date' to match DB
  event_time: string // Updated from 'time' to match DB
  description: string
  status: 'Upcoming' | 'Past' | 'Live'
  poster_url?: string | null // Updated from 'imageUrl' to match DB
}

export function EventCard({
  id,
  title,
  event_date,
  event_time,
  description,
  status,
  poster_url,
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Construct full image URL
  const fullImageUrl = poster_url ? `http://localhost:3000${poster_url}` : null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#2d5f5d]/40 group flex flex-col h-full relative">
      <div className="h-48 bg-[#0d1117] relative overflow-hidden">
        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if broken
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#161b22] to-[#0d1117] flex items-center justify-center">
            <Calendar className="w-12 h-12 text-[#30363d] opacity-50" />
          </div>
        )}

        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-10 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl py-1 min-w-[140px] z-10">
              <button className="w-full px-3 py-2 text-sm flex items-center gap-2 text-white hover:bg-[#0d1117]">
                <Pencil size={14} className="text-[#9ca3af]" /> Edit Event
              </button>
              <button className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-400 hover:bg-[#0d1117]">
                <Trash2 size={14} /> Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="bg-[#2d5f5d]/20 text-[#4fd1c5] border border-[#2d5f5d]/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
            {status}
          </span>
        </div>

        <h3 className="text-white font-semibold text-base line-clamp-1">{title}</h3>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs">
            <CalendarDays size={14} />
            <span>{new Date(event_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs">
            <Clock size={14} />
            <span>{event_time}</span>
          </div>
        </div>

        <p className="text-[#9ca3af] text-sm mt-3 line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>
      </div>
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: number
  created_at: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/notifications', { headers })
      if (res.ok) setNotifications(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    await fetch('http://localhost:3000/api/notifications/read-all', { method: 'PUT', headers })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all relative"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4fd1c5] text-[#0d1117] text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#4fd1c5] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${!n.is_read ? 'bg-[#2d5f5d]/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#4fd1c5] flex-shrink-0 mt-1.5" />}
                    <div className={!n.is_read ? '' : 'pl-4'}>
                      <p className="text-xs font-semibold text-white mb-0.5">{n.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
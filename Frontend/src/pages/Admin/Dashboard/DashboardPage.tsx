import { useState, useEffect } from 'react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
// BarChart3 can be removed from imports if not used elsewhere
import { AddDepartmentCard } from '../../../components/dashboard/AddDepartmentCard'
import { CalendarCard } from '../../../components/dashboard/CalendarCard'
import { DepartmentProgressCard } from '../../../components/dashboard/DepartmentProgressCard'
import { AssignTaskCard } from '../../../components/dashboard/AssignTaskCard'
import { PostEventCard } from '../../../components/dashboard/PostEventCard'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  task_id: number
  created_at: string
  is_read: number | boolean
}

interface DashboardPageProps {
  onLogout: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/notifications', { headers })
        if (res.ok) {
          setNotifications(await res.json())
        } else if (res.status === 401) {
          onLogout()
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [token])

  const unreadNotifications = notifications.filter(n => !n.is_read)

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, { 
        method: 'PUT', 
        headers 
      })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('http://localhost:3000/api/notifications/read-all', { 
        method: 'PUT', 
        headers 
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar - Fixed Width */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto custom-scrollbar" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="mb-8 flex justify-between items-start flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm">Managing Departments & Staff</p>
          </div>
          
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-[#161b22] border border-gray-800 hover:border-[#4fd1c5]/50 rounded-xl transition-all shadow-lg group"
          >
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#4fd1c5]" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-[#0f1419]">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>
        </header>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-24 right-8 w-96 bg-[#161b22] border border-[#4fd1c5]/20 rounded-xl shadow-2xl z-40 max-h-[500px] overflow-y-auto animate-in slide-in-from-right-4 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Notifications <span className="text-xs bg-[#4fd1c5]/10 text-[#4fd1c5] px-2 py-0.5 rounded-full">{unreadNotifications.length} New</span>
                </h3>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#4fd1c5] hover:text-[#4fd1c5]/80 transition-colors font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-lg border transition-colors ${notif.is_read ? 'bg-transparent border-gray-800/50' : 'bg-[#4fd1c5]/5 border-[#4fd1c5]/20'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        </div>
                        {notif.is_read === 0 && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="flex-shrink-0 text-[10px] text-[#4fd1c5] hover:text-white bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/30 px-3 py-1.5 rounded-md transition-all font-semibold whitespace-nowrap"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          {/* Top Row: Using a 12-column grid for better distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <AddDepartmentCard />
            </div>
            <div>
              <CalendarCard />
            </div>
            <div>
              <DepartmentProgressCard />
            </div>
          </div>

          {/* Middle Row: Full Width Task Assignment */}
          <div style={{ width: '100%', flexShrink: 0 }}>
            <AssignTaskCard />
          </div>

          {/* Bottom Row: Full Width Post Event */}
          <div style={{ width: '100%', flexShrink: 0, paddingBottom: '32px' }}>
            <PostEventCard />
          </div>
        </div>
      </main>
    </div>
  )
}
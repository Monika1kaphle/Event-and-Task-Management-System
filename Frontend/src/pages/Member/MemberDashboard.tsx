import { useState, useEffect } from 'react'
import { 
  Loader2, 
  Bell, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  LayoutDashboard, 
  ChevronDown, 
  User, 
  LogOut,
  TrendingUp,
  X
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Sidebar } from '../../components/layout/Sidebar'

interface Task {
  id: number
  title: string
  description: string
  priority: string
  status: string
  progress: number
  deadline: string
  assigned_to: number
  assigned_to_name: string
  department_name: string
  created_by_name: string
  work_done?: string
}

interface Event {
  id: number
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  poster_url: string
}

interface Notification {
  id: number
  title: string
  message: string
  type: string
  task_id: number
  created_at: string
  is_read: number | boolean
}

interface TaskStats {
  date: string
  completed: number
  inProgress: number
  pending: number
}

export function MemberDashboard({ onLogout }: { onLogout: () => void }) {
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [taskStats, setTaskStats] = useState<TaskStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    try {
      const [tasksRes, eventsRes, notifRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks', { headers }),
        fetch('http://localhost:3000/api/events', { headers }),
        fetch('http://localhost:3000/api/notifications', { headers }),
      ])

      if (tasksRes.status === 401 || eventsRes.status === 401 || notifRes.status === 401) {
        onLogout()
        return
      }

      if (tasksRes.ok) {
        const allTasks = await tasksRes.json()
        // Filter tasks assigned to current user
        const userTasks = allTasks.filter((task: Task) => task.assigned_to === user?.id)
        setMyTasks(userTasks)
        generateTaskStats(userTasks)
      }
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (notifRes.ok) setNotifications(await notifRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateTaskStats = (tasks: Task[]) => {
    // Generate basic stats for the last 7 days
    const stats: { [key: string]: TaskStats } = {}
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      stats[dateStr] = { date: dateStr, completed: 0, inProgress: 0, pending: 0 }
    }

    tasks.forEach(task => {
      if (task.deadline) {
        const taskDate = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (stats[taskDate]) {
          if (task.status === 'COMPLETED') stats[taskDate].completed++
          else if (task.status === 'IN_PROGRESS') stats[taskDate].inProgress++
          else if (task.status === 'PENDING') stats[taskDate].pending++
        }
      }
    })

    setTaskStats(Object.values(stats))
  }

  useEffect(() => { 
    fetchAll()
    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [])

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

  // Task Statistics
  const totalTasks = myTasks.length
  const completedTasks = myTasks.filter(t => t.status === 'COMPLETED').length
  const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS').length
  const pendingTasks = myTasks.filter(t => t.status === 'PENDING').length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.event_date)
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= today && eventDate <= weekFromNow
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        {/* Header Section */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Member Dashboard</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <LayoutDashboard size={16} className="text-[#4fd1c5]" />
              Track your tasks and upcoming events for <span className="text-white font-medium">{user?.department || 'Your Department'}</span>
            </p>
          </div>

          <div className="flex gap-4 items-center">
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

            {/* Polished User Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-800 bg-[#161b22] hover:border-gray-700 transition-all shadow-lg"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2d5f5d] to-[#1a3a38] flex items-center justify-center text-white font-bold shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <p className="text-sm font-bold text-white leading-none">{user?.name || 'Member'}</p>
                  <p className="text-[10px] text-[#4fd1c5] font-medium uppercase tracking-wider mt-1">
                    {user?.role?.replace('_', ' ') || 'MEMBER'}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                    <User size={14} /> Profile Settings
                  </button>
                  <div className="h-px bg-gray-800 my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notifications Panel Overlay */}
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
                  <p className="text-gray-500 text-center py-4">No recent activity.</p>
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

        {loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#4fd1c5]" />
            <p className="text-gray-500 animate-pulse font-medium">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Tasks', value: totalTasks, color: 'text-[#4fd1c5]', icon: BarChart3, bg: 'from-[#1a3a38]/40' },
                { label: 'Completed', value: completedTasks, color: 'text-green-400', icon: CheckCircle2, bg: 'from-green-900/10' },
                { label: 'In Progress', value: inProgressTasks, color: 'text-blue-400', icon: Clock, bg: 'from-blue-900/10' },
                { label: 'Completion Rate', value: `${overallProgress}%`, color: 'text-yellow-400', icon: TrendingUp, bg: 'from-yellow-900/10' }
              ].map((card, i) => (
                <div key={i} className={`bg-gradient-to-br ${card.bg} to-[#161b22] border border-gray-800 rounded-2xl p-6 hover:border-[#4fd1c5]/30 transition-all group`}>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-gray-400 text-sm font-medium">{card.label}</p>
                    <card.icon size={18} className="text-gray-600 group-hover:text-[#4fd1c5] transition-colors" />
                  </div>
                  <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Task Progress Chart */}
            <div className="bg-[#161b22]/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold">Your Task Progress</h3>
                  <p className="text-sm text-gray-500 mt-1">Task completion trend over the next 7 days</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="w-3 h-3 rounded-full bg-green-400" /> Completed
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="w-3 h-3 rounded-full bg-blue-400" /> In Progress
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="w-3 h-3 rounded-full bg-gray-600" /> Pending
                  </div>
                </div>
              </div>
              
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taskStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#161b22', 
                        borderRadius: '12px', 
                        border: '1px solid #374151', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' 
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#161b22', strokeWidth: 2 }} 
                      name="Completed" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inProgress" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#161b22', strokeWidth: 2 }} 
                      name="In Progress" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#6b7280" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#161b22', strokeWidth: 2 }} 
                      name="Pending" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Two Column Layout: My Tasks & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* My Tasks Section */}
              <div className="bg-[#161b22]/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6">My Assigned Tasks</h3>
                
                {myTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks assigned yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {myTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="w-full bg-[#0f1419] border border-gray-800 rounded-lg p-4 hover:border-[#4fd1c5]/30 transition-all text-left hover:shadow-lg hover:shadow-[#4fd1c5]/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{task.title}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-700/50 text-gray-300'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Priority: <span className={`font-bold ${
                            task.priority === 'HIGH' ? 'text-red-400' :
                            task.priority === 'MEDIUM' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>{task.priority}</span></span>
                          <span>Progress: <span className="text-[#4fd1c5] font-bold">{task.progress}%</span></span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div 
                            className="bg-[#4fd1c5] h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events Section */}
              <div className="bg-[#161b22]/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6">Upcoming Events</h3>
                
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming events in the next 7 days.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {upcomingEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-[#0f1419] border border-gray-800 rounded-lg p-4 hover:border-[#4fd1c5]/30 transition-all text-left hover:shadow-lg hover:shadow-[#4fd1c5]/20"
                      >
                        <h4 className="font-semibold text-white mb-2">{event.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{event.description}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>📅 <span className="text-gray-300">{new Date(event.event_date).toLocaleDateString()}</span></p>
                          <p>🕐 <span className="text-gray-300">{event.event_time}</span></p>
                          <p>📍 <span className="text-gray-300">{event.location}</span></p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-lg w-full p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedTask.title}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Status</p>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                  selectedTask.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700/50 text-gray-300'
                }`}>
                  {selectedTask.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Description</p>
                <p className="text-gray-200">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">Priority</p>
                  <p className={`font-semibold ${
                    selectedTask.priority === 'HIGH' ? 'text-red-400' :
                    selectedTask.priority === 'MEDIUM' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{selectedTask.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">Deadline</p>
                  <p className="text-gray-200">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-[#4fd1c5] h-3 rounded-full transition-all"
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-[#4fd1c5] font-bold text-sm">{selectedTask.progress}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">Created By</p>
                  <p className="text-gray-200">{selectedTask.created_by_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">Department</p>
                  <p className="text-gray-200">{selectedTask.department_name}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="w-full bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/20 text-[#4fd1c5] font-semibold py-2 rounded-lg transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-lg w-full p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">Description</p>
                <p className="text-gray-200">{selectedEvent.description}</p>
              </div>

              {selectedEvent.poster_url && (
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-2">Poster</p>
                  <img
                    src={selectedEvent.poster_url}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">📅 Date</p>
                  <p className="text-gray-200">{new Date(selectedEvent.event_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">🕐 Time</p>
                  <p className="text-gray-200">{selectedEvent.event_time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">📍 Location</p>
                <p className="text-gray-200">{selectedEvent.location}</p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/20 text-[#4fd1c5] font-semibold py-2 rounded-lg transition-colors mt-6"
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

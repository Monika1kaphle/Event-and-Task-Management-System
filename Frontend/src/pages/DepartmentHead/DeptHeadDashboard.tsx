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
  ResponsiveContainer, 
  AreaChart, 
  Area 
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
}

interface Notification {
  id: number
  title: string
  message: string
  type: string
  task_id: number
  created_at: string
  is_read: boolean
}

interface MemberStats {
  name: string
  assigned: number
  completed: number
  inProgress: number
  pending: number
  completionRate: number
}


export function DeptHeadDashboard({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [memberStats, setMemberStats] = useState<MemberStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [departmentName, setDepartmentName] = useState<string>('Department')

  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    try {
      const [tasksRes, notifRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks', { headers }),
        fetch('http://localhost:3000/api/notifications', { headers }),
      ])

      if (tasksRes.status === 401 || notifRes.status === 401) {
        onLogout()
        return
      }

      if (tasksRes.ok) {
        const allTasks = await tasksRes.json()
        setTasks(allTasks)
        calculateMemberStats(allTasks)
      }
      if (notifRes.ok) setNotifications(await notifRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateMemberStats = (allTasks: Task[]) => {
    const stats: { [key: string]: MemberStats } = {}
    allTasks.forEach(task => {
      if (!stats[task.assigned_to_name]) {
        stats[task.assigned_to_name] = {
          name: task.assigned_to_name,
          assigned: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          completionRate: 0,
        }
      }
      stats[task.assigned_to_name].assigned++
      if (task.status === 'COMPLETED') stats[task.assigned_to_name].completed++
      else if (task.status === 'IN_PROGRESS') stats[task.assigned_to_name].inProgress++
      else if (task.status === 'PENDING') stats[task.assigned_to_name].pending++
    })

    const statsArray = Object.values(stats).map(s => ({
      ...s,
      completionRate: s.assigned > 0 ? Math.round((s.completed / s.assigned) * 100) : 0,
    }))
    setMemberStats(statsArray)
  }

// Fetch department name from departments where user is head
  useEffect(() => {
    const fetchDepartmentName = async () => {
      try {
        if (!user?.id) {
          console.log('❌ No user ID found')
          return
        }
        console.log('🔍 Fetching departments to find one where user is head...')
        
        const deptRes = await fetch('http://localhost:3000/api/departments/all-with-events', { headers })
        if (deptRes.ok) {
          const allDepts = await deptRes.json()
          // Filter to only actual departments (not bare events)
          const departments = allDepts.filter((d: any) => d.type === 'department' || !d.type)
          
          // Find department where current user is the head
          const userDept = departments.find((d: any) => d.head_id === user?.id)
          
          if (userDept) {
            console.log('✅ Found department where user is head:', userDept.name)
            setDepartmentName(userDept.name)
          } else {
            console.log('❌ User is not a head of any department')
          }
        } else {
          console.log('❌ Department fetch failed:', deptRes.status)
        }
      } catch (err) {
        console.error('❌ Error fetching department:', err)
      }
    }
    fetchDepartmentName()
  }, [token])

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
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
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

  // Overview Stats (Department Wide)
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
            <h1 className="text-4xl font-bold text-white tracking-tight">Department Head Dashboard</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <LayoutDashboard size={16} className="text-[#4fd1c5]" />
              Manage tasks and track team progress for <span className="text-white font-medium">{departmentName}</span>
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
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <p className="text-sm font-bold text-white leading-none">{user?.name || 'Dept Head'}</p>
                  <p className="text-[10px] text-[#4fd1c5] font-medium uppercase tracking-wider mt-1">
                    {user?.role?.replace('_', ' ') || 'DEPT_HEAD'}
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
                    <div key={notif.id} className={`p-4 rounded-lg border transition-colors group ${notif.is_read ? 'bg-transparent border-gray-800/50' : 'bg-[#4fd1c5]/5 border-[#4fd1c5]/20'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] text-[#4fd1c5] hover:text-[#4fd1c5]/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all font-medium"
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
            <p className="text-gray-500 animate-pulse font-medium">Synchronizing department data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Tasks', value: totalTasks, color: 'text-[#4fd1c5]', icon: BarChart3, bg: 'from-[#1a3a38]/40' },
                { label: 'Completed', value: completedTasks, color: 'text-green-400', icon: CheckCircle2, bg: 'from-green-900/10' },
                { label: 'In Progress', value: inProgressTasks, color: 'text-blue-400', icon: Clock, bg: 'from-blue-900/10' },
                { label: 'Overall Efficiency', value: `${overallProgress}%`, color: 'text-yellow-400', icon: TrendingUp, bg: 'from-yellow-900/10' }
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

            {/* Department Progress Chart (Member Breakdown) */}
            <div className="bg-[#161b22]/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold">Team Performance Breakdown</h3>
                  <p className="text-sm text-gray-500 mt-1">Comparison of assigned workload vs. completion efficiency per member</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-[#4fd1c5]">
                    <span className="w-3 h-3 rounded-full bg-[#4fd1c5]" /> Completion %
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="w-3 h-3 rounded-full bg-gray-600" /> Tasks Assigned
                  </div>
                </div>
              </div>
              
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberStats}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="name" 
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
                    <Area 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#4fd1c5" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRate)" 
                      name="Completion Rate %" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="assigned" 
                      stroke="#4b5563" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#161b22', strokeWidth: 2 }} 
                      name="Total Tasks Assigned" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
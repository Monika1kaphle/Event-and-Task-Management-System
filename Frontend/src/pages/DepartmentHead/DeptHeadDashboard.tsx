import { useState, useEffect } from 'react'
import { Loader2, Bell } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [tasksRes, usersRes, notifRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks', { headers }),
        fetch('http://localhost:3000/api/users', { headers }),
        fetch('http://localhost:3000/api/notifications', { headers }),
      ])

      if (tasksRes.status === 401 || usersRes.status === 401 || notifRes.status === 401) {
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

  useEffect(() => { 
    fetchAll()
    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [])

  const unreadNotifications = notifications.filter(n => !n.is_read)

  // Overview Stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Department Head Dashboard</h1>
            <p className="text-lg text-gray-400">Manage tasks and track team progress.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-[#161b22] border border-gray-800 hover:border-[#4fd1c5]/50 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-800 bg-[#161b22]">
              <div className="w-8 h-8 rounded-full bg-[#2d5f5d] flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-white">{user?.name || 'Dept Head'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'DEPT_HEAD'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-24 right-8 w-96 bg-[#161b22] border border-[#4fd1c5]/20 rounded-xl shadow-2xl z-40 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Notifications</h3>
              <div className="space-y-3">
                {notifications.length === 0 ? <p className="text-gray-400">No notifications.</p> : 
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 rounded-lg ${notif.is_read ? 'bg-gray-600/20' : 'bg-blue-500/20'}`}>
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{notif.message}</p>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#1a3a38] to-[#0f2420] border border-[#4fd1c5]/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Total Tasks</p>
                <p className="text-4xl font-bold text-[#4fd1c5]">{totalTasks}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1a3a38] to-[#0f2420] border border-[#4fd1c5]/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-400">{completedTasks}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1a3a38] to-[#0f2420] border border-[#4fd1c5]/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">In Progress</p>
                <p className="text-4xl font-bold text-blue-400">{inProgressTasks}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1a3a38] to-[#0f2420] border border-[#4fd1c5]/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Overall Progress</p>
                <p className="text-4xl font-bold text-yellow-400">{overallProgress}%</p>
              </div>
            </div>

            {/* Department Progress Chart */}
            <div className="bg-gradient-to-br from-[#161b22] to-[#0f1419] border border-[#4fd1c5]/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Department Progress</h3>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memberStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d4a48" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161b22', borderColor: '#4fd1c5' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="completionRate" stroke="#4fd1c5" strokeWidth={2} name="Completion %" />
                    <Line type="monotone" dataKey="assigned" stroke="#999" strokeWidth={2} name="Assigned Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
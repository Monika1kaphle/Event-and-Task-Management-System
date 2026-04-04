import { useState, useEffect } from 'react'
import { Loader2, Bell, ChevronDown, User, LogOut, Search, Filter, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import ReactDOM from 'react-dom'
import { Sidebar } from '../../components/layout/Sidebar'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

interface Notification {
  id: number
  title: string
  message: string
  type: string
  task_id: number
  created_at: string
  is_read: number | boolean
}

export function MemberTasksPage({ onLogout }: { onLogout: () => void }) {
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [updateModal, setUpdateModal] = useState<{ taskId: number; title: string } | null>(null)
  const [updateForm, setUpdateForm] = useState({ status: 'PENDING', progress: 0, work_done: '' })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchData = async () => {
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
        const userTasks = allTasks.filter((task: Task) => task.assigned_to === user?.id)
        setMyTasks(userTasks)
        setFilteredTasks(userTasks)
      }
      if (notifRes.ok) setNotifications(await notifRes.json())
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = myTasks

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTasks(filtered)
  }, [searchTerm, statusFilter, myTasks])

  const openUpdateModal = (task: Task) => {
    setUpdateModal({ taskId: task.id, title: task.title })
    setUpdateForm({ status: task.status, progress: task.progress, work_done: '' })
    setUpdateMsg(null)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateModal) return
    setUpdating(true)
    setUpdateMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${updateModal.taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: updateForm.status,
          progress: updateForm.progress,
          work_done: updateForm.work_done,
        }),
      })
      if (res.ok) {
        setUpdateMsg({ type: 'success', text: 'Task updated successfully!' })
        setTimeout(() => {
          setUpdateModal(null)
          fetchData()
        }, 800)
      } else {
        const data = await res.json()
        setUpdateMsg({ type: 'error', text: data.error || 'Failed to update task.' })
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Server error.' })
    } finally {
      setUpdating(false)
    }
  }

  const unreadNotifications = notifications.filter(n => n.is_read === 0)

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
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const taskStats = {
    total: myTasks.length,
    completed: myTasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
    pending: myTasks.filter(t => t.status === 'PENDING').length,
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        {/* Header Section */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">My Tasks</h1>
            <p className="text-gray-400 mt-1">Manage and track your assigned tasks</p>
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

            {/* User Profile */}
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
            <p className="text-gray-500 animate-pulse font-medium">Loading your tasks...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Tasks', value: taskStats.total, color: 'text-[#4fd1c5]' },
                { label: 'Completed', value: taskStats.completed, color: 'text-green-400' },
                { label: 'In Progress', value: taskStats.inProgress, color: 'text-blue-400' },
                { label: 'Pending', value: taskStats.pending, color: 'text-yellow-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-[#4fd1c5] outline-none transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-white focus:border-[#4fd1c5] outline-none transition-colors cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No tasks found</p>
                  <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="w-full bg-[#161b22]/50 border border-gray-800 rounded-xl p-6 hover:border-[#4fd1c5]/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-[#4fd1c5] transition-colors">{task.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openUpdateModal(task)}
                          className="text-sm bg-[#2d5f5d] hover:bg-[#3a7a77] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-sm bg-[#4fd1c5]/10 hover:bg-[#4fd1c5]/20 text-[#4fd1c5] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Deadline</p>
                        <p className="text-gray-200">{new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Department</p>
                        <p className="text-gray-200">{task.department_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-[#4fd1c5] h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[#4fd1c5] font-bold text-sm whitespace-nowrap">{task.progress}%</span>
                    </div>
                  </div>
                ))
              )}
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

      {/* Update Task Modal */}
      {updateModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">Update Task</h3>
              <button
                onClick={() => setUpdateModal(null)}
                className="text-gray-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="bg-[#0d1117] rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-500 mb-0.5">Task</p>
                <p className="text-base font-semibold text-white">{updateModal.title}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                <select
                  value={updateForm.status}
                  onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-base text-white focus:border-[#4fd1c5] outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Work Done / Update</label>
                <textarea
                  placeholder="Describe what you've done..."
                  value={updateForm.work_done}
                  onChange={e => setUpdateForm({ ...updateForm, work_done: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 text-white focus:border-[#4fd1c5] outline-none resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <label>Progress</label>
                  <span className="text-[#4fd1c5] font-medium">{updateForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateForm.progress}
                  onChange={e => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                  className="w-full accent-[#4fd1c5]"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {updateMsg && (
                <div className={`flex items-center gap-2 text-base rounded-lg px-3 py-2.5 ${updateMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {updateMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {updateMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUpdateModal(null)}
                  className="flex-1 border border-gray-800 text-gray-400 hover:text-white py-2.5 rounded-lg text-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={updating}
                  className="flex-1 bg-[#2d5f5d] hover:bg-[#3a7a77] text-white py-2.5 rounded-lg text-base font-medium transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Sidebar } from '../../components/layout/Sidebar'
import {
  Plus, Trash2, Loader2, CheckCircle, XCircle,
  User, Users, Clock, AlertCircle, CheckSquare
} from 'lucide-react'

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
  department_id: number
  department_name: string
  created_by_name: string
}

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  department_id: number | null
  status: string
}

interface Department {
  id: number
  name: string
}

export default function DeptHeadTaskPage({ onLogout }: { onLogout: () => void }) {
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [teamTasks, setTeamTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<TeamMember[]>([])
  const [deptInfo, setDeptInfo] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [updateModal, setUpdateModal] = useState<{ taskId: number; title: string } | null>(null)
  const [updateForm, setUpdateForm] = useState({ status: 'PENDING', progress: 0 })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [activeTab, setActiveTab] = useState<'overview' | 'mytasks' | 'team' | 'members'>('overview')

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '', deadline: '', priority: 'MEDIUM',
  })



  const fetchAllData = async () => {
    setLoading(true)
    try {
      const myDeptId = currentUser?.department_id
      if (!myDeptId) { setLoading(false); return }

      const [tasksRes, usersRes, deptsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tasks`, { headers }),
        fetch(`${API_BASE_URL}/api/users`, { headers }),
        fetch(`${API_BASE_URL}/api/departments`, { headers }),
      ])

      if (tasksRes.status === 401) return onLogout()

      if (tasksRes.ok && usersRes.ok && deptsRes.ok) {
        const allTasks: Task[] = await tasksRes.json()
        const allUsers: TeamMember[] = await usersRes.json()
        const allDepts: Department[] = await deptsRes.json()

        // DEBUG: Log current user and department info
        console.log('🔍 CURRENT USER:', currentUser)
        console.log('📊 CURRENT USER ID:', currentUser.id)
        console.log('📊 CURRENT USER DEPT ID:', currentUser.department_id)

        const dept = allDepts.find(d => Number(d.id) === Number(myDeptId))
        setDeptInfo(dept || null)

        const deptTasks = allTasks.filter(t => Number(t.department_id) === Number(myDeptId))
        console.log('📋 ALL DEPARTMENT TASKS:', deptTasks)
        
        // Detailed logging for task assignment
        deptTasks.forEach(t => {
          console.log(`Task: "${t.title}" | assigned_to: ${t.assigned_to} (type: ${typeof t.assigned_to}) | dept head id: ${currentUser.id} (type: ${typeof currentUser.id})`)
        })

        const myTasks = deptTasks.filter(t => Number(t.assigned_to) === Number(currentUser.id))
        const teamTasks = deptTasks.filter(t => Number(t.assigned_to) !== Number(currentUser.id))

        console.log('✅ MY TASKS (assigned to me):', myTasks)
        console.log('👥 TEAM TASKS (assigned to team members):', teamTasks)

        setMyTasks(myTasks)
        setTeamTasks(teamTasks)

        setUsers(allUsers.filter(u =>
          u && Number(u.department_id) === Number(myDeptId) &&
          Number(u.id) !== Number(currentUser.id) &&
          u.status === 'active'
        ))
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAllData() }, [])

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.assigned_to) { setMsg({ type: 'error', text: 'Please select a team member.' }); return }
    setSubmitting(true); setMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST', headers,
        body: JSON.stringify({
          title: form.title, description: form.description,
          department_id: Number(currentUser.department_id),
          assigned_to: parseInt(form.assigned_to),
          deadline: form.deadline || null, priority: form.priority,
        }),
      })
      if (res.ok) {
        setMsg({ type: 'success', text: 'Task assigned successfully!' })
        setForm({ title: '', description: '', assigned_to: '', deadline: '', priority: 'MEDIUM' })
        setShowTaskForm(false)
        fetchAllData()
      } else {
        const data = await res.json()
        setMsg({ type: 'error', text: data.error || 'Failed to assign task.' })
      }
    } catch { setMsg({ type: 'error', text: 'Server error.' }) }
    finally { setSubmitting(false) }
  }



  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: 'DELETE', headers })
    if (res.ok) fetchAllData()
  }

  const openUpdateModal = (task: Task) => {
    setUpdateModal({ taskId: task.id, title: task.title })
    setUpdateForm({ status: task.status, progress: task.progress })
    setUpdateMsg(null)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateModal) return
    setUpdating(true); setUpdateMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${updateModal.taskId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ status: updateForm.status, progress: parseInt(String(updateForm.progress)) }),
      })
      if (res.ok) {
        setUpdateMsg({ type: 'success', text: 'Task updated!' })
        setTimeout(() => { setUpdateModal(null); fetchAllData() }, 800)
      } else {
        const data = await res.json()
        setUpdateMsg({ type: 'error', text: data.error || 'Failed to update.' })
      }
    } catch { setUpdateMsg({ type: 'error', text: 'Server error.' }) }
    finally { setUpdating(false) }
  }

  const priorityBadge = (p: string) => ({
    HIGH: 'bg-red-500/15 text-red-400 border border-red-500/30',
    MEDIUM: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    LOW: 'bg-green-500/15 text-green-400 border border-green-500/30',
  }[p] || 'bg-gray-500/15 text-gray-400')

  const statusBadge = (s: string) => ({
    PENDING: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    IN_PROGRESS: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    COMPLETED: 'bg-green-500/15 text-green-400 border border-green-500/30',
  }[s] || 'bg-gray-500/15 text-gray-400')

  const groupedTasks = useMemo(() => ({
    pending: teamTasks.filter(t => t.status === 'PENDING'),
    inProgress: teamTasks.filter(t => t.status === 'IN_PROGRESS'),
    completed: teamTasks.filter(t => t.status === 'COMPLETED'),
  }), [teamTasks])

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'mytasks', label: `My Tasks (${myTasks.length})` },
    { key: 'team', label: `Team Pipeline (${teamTasks.length})` },
    { key: 'members', label: `Members (${users.length})` },
  ]

  // ── Task row component (used for both my tasks and team tasks)
  const TaskRow = ({ task, canUpdate }: { task: Task; canUpdate: boolean }) => (
    <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-white truncate">{task.title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityBadge(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 truncate mb-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.assigned_to_name}
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            <span className="text-gray-700">By: {task.created_by_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canUpdate && (
            <button
              onClick={() => openUpdateModal(task)}
              className="text-sm bg-[#2d5f5d] hover:bg-[#3a7a77] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Update
            </button>
          )}
          {!canUpdate && (
            <span className="text-xs text-gray-600 italic">Member updates</span>
          )}
          <button
            onClick={() => handleDelete(task.id)}
            className="text-gray-600 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span className="text-[#4fd1c5] font-medium">{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4fd1c5] transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Update Modal */}
      {updateModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">Update Task</h3>
              <button onClick={() => setUpdateModal(null)} className="text-gray-500 hover:text-white">
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
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <label>Progress</label>
                  <span className="text-[#4fd1c5] font-medium">{updateForm.progress}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={updateForm.progress}
                  onChange={e => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                  className="w-full accent-[#4fd1c5]"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
              {updateMsg && (
                <div className={`flex items-center gap-2 text-base rounded-lg px-3 py-2.5 ${updateMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {updateMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {updateMsg.text}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setUpdateModal(null)}
                  className="flex-1 border border-gray-800 text-gray-400 hover:text-white py-2.5 rounded-lg text-base transition-colors">
                  Cancel
                </button>
                <button disabled={updating}
                  className="flex-1 bg-[#2d5f5d] hover:bg-[#3a7a77] text-white py-2.5 rounded-lg text-base font-medium transition-colors disabled:opacity-50">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <main className="flex-1 ml-64 overflow-y-auto h-screen">

        {/* Header */}
        <div className="bg-[#161b22] border-b border-gray-800 px-8 py-6">
          {!deptInfo && !loading && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">Not assigned to a department. Contact your administrator.</p>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">
                {loading ? 'Loading...' : deptInfo?.name || 'Department'} Dashboard
              </h1>
              <p className="text-base text-gray-400">
                {currentUser.name} · Department Head · {users.length} member{users.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowTaskForm(!showTaskForm) }}
                className="flex items-center gap-2 bg-[#2d5f5d] hover:bg-[#3a7a77] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Assign Task
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: 'My Tasks', value: myTasks.length, color: 'text-blue-400' },
              { label: 'Team Tasks', value: teamTasks.length, color: 'text-purple-400' },
              { label: 'Completed', value: [...myTasks, ...teamTasks].filter(t => t.status === 'COMPLETED').length, color: 'text-green-400' },
              { label: 'In Progress', value: [...myTasks, ...teamTasks].filter(t => t.status === 'IN_PROGRESS').length, color: 'text-yellow-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inline forms */}
        {showTaskForm && (
          <div className="px-8 py-4 bg-[#0d1117] border-b border-gray-800">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-[#4fd1c5] mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> New Task
              </h3>
              <form onSubmit={handleTaskSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Task title *" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-base focus:border-[#4fd1c5] outline-none"
                  />
                  <select
                    required value={form.assigned_to}
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    className="bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-base focus:border-[#4fd1c5] outline-none"
                  >
                    <option value="">Select member *</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <textarea
                  placeholder="Description (optional)" rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-base focus:border-[#4fd1c5] outline-none resize-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="date" value={form.deadline} min={today}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-base focus:border-[#4fd1c5] outline-none"
                  />
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-base focus:border-[#4fd1c5] outline-none"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                  <button disabled={submitting}
                    className="bg-[#2d5f5d] hover:bg-[#3a7a77] text-white text-base font-medium rounded-lg transition-colors disabled:opacity-50">
                    {submitting ? 'Assigning...' : 'Create Task'}
                  </button>
                </div>
                {msg && (
                  <div className={`flex items-center gap-2 text-base rounded-lg px-3 py-2.5 ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {msg.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-800 px-8">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-3.5 text-base font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-[#4fd1c5] text-[#4fd1c5]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-4">All Department Tasks</h2>
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : [...myTasks, ...teamTasks].length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks yet. Create one to get started.</p>
                </div>
              ) : (
                [...myTasks, ...teamTasks].map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    canUpdate={Number(task.assigned_to) === Number(currentUser.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* MY TASKS TAB */}
          {activeTab === 'mytasks' && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-4">Tasks Assigned to Me</h2>
              {myTasks.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks assigned to you yet.</p>
                </div>
              ) : (
                myTasks.map(task => <TaskRow key={task.id} task={task} canUpdate={true} />)
              )}
            </div>
          )}

          {/* TEAM PIPELINE TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {[
                { label: 'Pending', tasks: groupedTasks.pending, dot: 'bg-yellow-500' },
                { label: 'In Progress', tasks: groupedTasks.inProgress, dot: 'bg-blue-500' },
                { label: 'Completed', tasks: groupedTasks.completed, dot: 'bg-green-500' },
              ].map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${group.dot}`} />
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                      {group.label} ({group.tasks.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {group.tasks.length === 0 ? (
                      <p className="text-gray-700 text-sm italic pl-4">No {group.label.toLowerCase()} tasks</p>
                    ) : (
                      group.tasks.map(task => <TaskRow key={task.id} task={task} canUpdate={false} />)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-4">Team Members</h2>
              {users.length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No members yet. Invite someone!</p>
                </div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="bg-[#161b22] border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-700 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#2d5f5d]/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4fd1c5] text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className="text-sm font-medium bg-[#2d5f5d]/20 text-[#4fd1c5] px-2.5 py-1 rounded-full border border-[#4fd1c5]/20 flex-shrink-0">
                      {user.role}
                    </span>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500">
                        {teamTasks.filter(t => t.assigned_to === user.id).length} tasks
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
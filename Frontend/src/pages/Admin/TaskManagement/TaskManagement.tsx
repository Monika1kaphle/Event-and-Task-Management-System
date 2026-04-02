import { useState, useEffect } from 'react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Plus, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'

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

interface Department { 
  id: number; 
  name: string 
}
interface User {
  id: number
  name: string
  email: string
  role: string
  department_id: number | null
  status: string
}

export function TaskManagement({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isDeptHead = currentUser?.role === 'DEPT_HEAD'

  // Toggle between assigning to dept head or member
  const [assigneeRole, setAssigneeRole] = useState<'DEPT_HEAD' | 'MEMBER'>(isDeptHead ? 'MEMBER' : 'DEPT_HEAD')

  const [form, setForm] = useState({
    title: '',
    description: '',
    department_id: '',
    assigned_to: '',
    deadline: '',
    priority: 'MEDIUM',
  })

  const today = new Date().toISOString().split('T')[0]

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [tasksRes, deptsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/api/tasks', { headers }),
        fetch('http://localhost:3000/api/departments', { headers }),
        fetch('http://localhost:3000/api/users', { headers }),
      ])
      
      // Check for unauthorized responses
      if (tasksRes.status === 401 || deptsRes.status === 401 || usersRes.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        onLogout()
        return
      }
      
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (deptsRes.ok) setDepartments(await deptsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Filter assignees by selected department + role toggle
  const getAssignees = () => {
    if (!form.department_id) return []
    return users.filter(u =>
      String(u.department_id) === form.department_id &&
      u.status === 'active' &&
      u.role === assigneeRole &&
      (isDeptHead ? u.id !== currentUser?.id : true) // Exclude self if DEPT_HEAD
    )
  }

  const assignees = getAssignees()

  const handleDeptChange = (deptId: string) => {
    setForm({ ...form, department_id: deptId, assigned_to: '' })
    // Admin always assigns to DEPT_HEAD, never toggle
    setAssigneeRole('DEPT_HEAD')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.assigned_to) {
      setMsg({ type: 'error', text: 'Title and assignee are required.' })
      return
    }
    if (!form.department_id) {
      setMsg({ type: 'error', text: 'Please select a department.' })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const res = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          department_id: parseInt(form.department_id),
          deadline: form.deadline || null,
        }),
      })
      
      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        onLogout()
        return
      }
      
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: 'Task created and assignee notified!' })
        setForm({ title: '', description: '', department_id: '', assigned_to: '', deadline: '', priority: 'MEDIUM' })
        setAssigneeRole('DEPT_HEAD')
        setShowForm(false)
        fetchAll()
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to create task.' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Server error.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE', headers })
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      onLogout()
      return
    }
    if (res.ok) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const filteredTasks = filterStatus === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === filterStatus)

  const statusColor = (s: string) => ({
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
    COMPLETED: 'text-green-400 bg-green-400/10',
  }[s] || 'text-gray-400 bg-gray-400/10')

  const priorityColor = (p: string) => ({
    HIGH: 'text-red-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
  }[p] || 'text-gray-400')

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Task Management</h1>
            <p className="text-sm text-gray-400">Create and track tasks across departments.</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setMsg(null) }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2d5f5d] to-[#1a4d49] hover:from-[#3a7a77] hover:to-[#226b66] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </header>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 mb-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Create New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Title + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Prepare event banner"
                    required
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details..."
                  rows={3}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] resize-none transition-colors"
                />
              </div>

              {/* Row 2: Department + Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
                  <select
                    value={form.department_id}
                    onChange={e => handleDeptChange(e.target.value)}
                    required
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  >
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    min={today}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  />
                </div>
              </div>

              {/* Assignee section */}
              {form.department_id && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-3">Assign To Department Head *</label>

                  {assignees.length === 0 ? (
                    <div className="bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-500">
                      No department head assigned to this department yet.
                    </div>
                  ) : (
                    <select
                      value={form.assigned_to}
                      onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                      required
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                    >
                      <option value="">
                        Select department head
                      </option>
                      {assignees.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {!form.department_id && (
                <p className="text-xs text-gray-600 italic">
                  Select a department first to choose an assignee.
                </p>
              )}

              {/* Feedback message */}
              {msg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  msg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {msg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-xs">{msg.text}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setMsg(null) }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-800 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.assigned_to}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-[#2d5f5d] to-[#1a4d49] hover:from-[#3a7a77] hover:to-[#226b66] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-3 mb-6">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase ${
                filterStatus === s
                  ? 'bg-gradient-to-r from-[#2d5f5d] to-[#1a4d49] text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 bg-[#161b22] border border-gray-800 hover:border-gray-600'
              }`}
            >
              {s === 'ALL' ? 'All'
                : s === 'IN_PROGRESS' ? 'In Progress'
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-[#161b22] border border-gray-800 rounded-xl p-4 hover:border-[#4fd1c5]/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white flex-1 min-w-0">{task.title}</h3>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${statusColor(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${priorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>Assigned to: <span className="text-gray-300 font-medium">{task.assigned_to_name}</span></span>
                      {task.department_name && (
                        <span>Dept: <span className="text-gray-300 font-medium">{task.department_name}</span></span>
                      )}
                      {task.deadline && (
                        <span>Due: <span className="text-gray-300 font-medium">{new Date(task.deadline).toLocaleDateString()}</span></span>
                      )}
                      {task.created_by_name && (
                        <span>By: <span className="text-gray-300 font-medium">{task.created_by_name}</span></span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="text-[#4fd1c5]">{task.progress ?? 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4fd1c5] to-[#2d5f5d] transition-all duration-500"
                          style={{ width: `${task.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
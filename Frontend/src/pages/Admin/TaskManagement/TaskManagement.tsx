import { useState, useEffect } from 'react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Plus, Trash2, Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react'

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

interface Department { id: number; name: string }
interface User { id: number;
   name: string;
   email: string;
   role: string;
  department_id: number | null;
  status: string }

export function TaskManagement({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  const [form, setForm] = useState({
    title: '',
    description: '',
    department_id: '',
    assigned_to: '',
    deadline: '',
    priority: 'MEDIUM',
  })

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

  // Filter members by selected department
  const availableAssignees = form.department_id
    ? users.filter(u => String(u.department_id) === form.department_id && u.status === 'active')
    : users.filter(u => u.role !== 'CLIENT' && u.status === 'active')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.assigned_to) {
      setMsg({ type: 'error', text: 'Title and assignee are required.' })
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
          department_id: form.department_id || null,
          deadline: form.deadline || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: 'Task created and assignee notified!' })
        setForm({ title: '', description: '', department_id: '', assigned_to: '', deadline: '', priority: 'MEDIUM' })
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
    await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE', headers })
    setTasks(tasks.filter(t => t.id !== id))
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#2d5f5d] hover:bg-[#3a7a77] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </header>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-[#161b22] border border-[#4fd1c5]/20 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-5">New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Task Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Prepare event banner"
                    required
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details..."
                  rows={2}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Department</label>
                  <select
                    value={form.department_id}
                    onChange={e => setForm({ ...form, department_id: e.target.value, assigned_to: '' })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5]"
                  >
                    <option value="">All departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Assign To *</label>
                  <select
                    value={form.assigned_to}
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    required
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5]"
                  >
                    <option value="">Select person</option>
                    {availableAssignees.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5]"
                  />
                </div>
              </div>

              {msg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {msg.text}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-[#2d5f5d] hover:bg-[#3a7a77] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterStatus === s ? 'bg-[#2d5f5d] text-white' : 'text-gray-400 hover:text-white bg-[#161b22] border border-gray-800'}`}
            >
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${priorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>Assigned to: <span className="text-gray-300">{task.assigned_to_name}</span></span>
                      {task.department_name && <span>Dept: <span className="text-gray-300">{task.department_name}</span></span>}
                      {task.deadline && <span>Due: <span className="text-gray-300">{new Date(task.deadline).toLocaleDateString()}</span></span>}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#4fd1c5] transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
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
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Plus, Building2, CalendarDays, Trash2, ArrowLeft, MoreVertical, Pencil } from 'lucide-react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface DepartmentManagementProps {
  onLogout: () => void
}

function computeEventStatus(event_date: string, event_time: string): 'Upcoming' | 'Live' | 'Past' {
  const now = new Date()
  const eventDate = new Date(event_date)
  const year = eventDate.getFullYear()
  const month = String(eventDate.getMonth() + 1).padStart(2, '0')
  const day = String(eventDate.getDate()).padStart(2, '0')
  const datePart = `${year}-${month}-${day}`
  const timePart = event_time.slice(0, 5)
  const eventDateTime = new Date(`${datePart}T${timePart}:00`)
  const diffMs = eventDateTime.getTime() - now.getTime()
  const diffMins = diffMs / (1000 * 60)
  
  if (diffMs < 0 && Math.abs(diffMins) > 60) return 'Past'
  if (Math.abs(diffMins) <= 60) return 'Live'
  return 'Upcoming'
}

export function DepartmentManagement({ onLogout }: DepartmentManagementProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // If arrived from event creation, these will be set
  const urlEventId = searchParams.get('event_id')
  const urlEventTitle = searchParams.get('event_title')

  // Tab: 'event' or 'general'
  const [activeTab, setActiveTab] = useState<'event' | 'general'>(urlEventId ? 'event' : 'general')

  const [departments, setDepartments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(!!urlEventId) // auto-open form if came from event creation

  // For event tab context
  const [selectedEventId, setSelectedEventId] = useState<string>(urlEventId || '')
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>(urlEventTitle || '')
  const [events, setEvents] = useState<any[]>([])

  const [formData, setFormData] = useState({ name: '', head_id: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit and Delete state
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null)
  const [editingDeptName, setEditingDeptName] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // Fetch users (for head selection)
  useEffect(() => {
    axios.get('http://localhost:3000/api/users', { headers })
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error fetching users:', err)
        if (err.response?.status === 401) onLogout()
      })
  }, [token, onLogout])

  // Fetch events list (for event tab dropdown)
  useEffect(() => {
    axios.get('http://localhost:3000/api/events', { headers })
      .then(res => setEvents(res.data))
      .catch(err => {
        console.error('Error fetching events:', err)
        if (err.response?.status === 401) onLogout()
      })
  }, [token, onLogout])

  // Fetch departments based on active tab
  useEffect(() => {
    setLoading(true)
    const url = activeTab === 'event' && selectedEventId
      ? `http://localhost:3000/api/departments/event/${selectedEventId}`
      : activeTab === 'general'
      ? 'http://localhost:3000/api/departments'
      : null

    if (!url) { setLoading(false); setDepartments([]); return }

    axios.get(url, { headers })
      .then(res => { setDepartments(res.data); setLoading(false) })
      .catch(err => {
        console.error('Error fetching departments:', err)
        if (err.response?.status === 401) onLogout()
        setLoading(false)
      })
  }, [activeTab, selectedEventId, token, onLogout])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        head_id: formData.head_id || null,
        event_id: activeTab === 'event' ? selectedEventId || null : null
      }
      await axios.post('http://localhost:3000/api/departments', payload, { headers })
      setFormData({ name: '', head_id: '' })
      setShowForm(false)
      // Refresh
      const url = activeTab === 'event' && selectedEventId
        ? `http://localhost:3000/api/departments/event/${selectedEventId}`
        : 'http://localhost:3000/api/departments'
      const res = await axios.get(url, { headers })
      setDepartments(res.data)
    } catch (err: any) {
      console.error('Error creating department:', err)
      if (err.response?.status === 401) {
        onLogout()
      } else {
        alert('Failed to create department: ' + (err.response?.data?.error || err.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (deptId: number) => {
    if (!editingDeptName.trim()) {
      alert('Department name cannot be empty')
      return
    }
    try {
      await axios.put(`http://localhost:3000/api/departments/${deptId}`, 
        { name: editingDeptName }, 
        { headers }
      )
      setEditingDeptId(null)
      setEditingDeptName('')
      setMenuOpenId(null)
      
      // Refresh departments
      const url = activeTab === 'event' && selectedEventId
        ? `http://localhost:3000/api/departments/event/${selectedEventId}`
        : 'http://localhost:3000/api/departments'
      const res = await axios.get(url, { headers })
      setDepartments(res.data)
    } catch (err: any) {
      console.error('Error updating department:', err)
      alert('Failed to update department: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleDelete = async (deptId: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`http://localhost:3000/api/departments/${deptId}`, { headers })
        setMenuOpenId(null)
        
        // Refresh departments
        const url = activeTab === 'event' && selectedEventId
          ? `http://localhost:3000/api/departments/event/${selectedEventId}`
          : 'http://localhost:3000/api/departments'
        const res = await axios.get(url, { headers })
        setDepartments(res.data)
      } catch (err: any) {
        console.error('Error deleting department:', err)
        alert('Failed to delete department: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpenId])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            {urlEventId && (
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 text-[#9ca3af] hover:text-white text-sm mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </button>
            )}
            <h1 className="text-3xl font-bold text-white mb-1">Department Management</h1>
            <p className="text-sm text-[#9ca3af]">
              Create and manage departments for events or general task assignment.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#161b22] border border-[#30363d] rounded-xl p-1 w-fit mb-8">
          <button
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'event'
                ? 'bg-[#2d5f5d] text-white shadow'
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Event Departments
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-[#2d5f5d] text-white shadow'
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            General Departments
          </button>
        </div>

        {/* Event selector (only in event tab) */}
        {activeTab === 'event' && (
          <div className="bg-[#161b22]/80 border border-[#30363d] rounded-xl p-5 mb-6">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">
              Select Event to manage departments for:
            </label>
            <select
  value={selectedEventId}
  onChange={e => {
    const id = e.target.value
    const title = events.find(ev => String(ev.id) === id)?.title || ''
    setSelectedEventId(id)
    setSelectedEventTitle(title)
  }}
  className="bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 w-full max-w-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
>
  {/* Show placeholder only if NOT coming from event creation */}
  {!urlEventId && <option value="">— Choose an event —</option>}
  {events
    .filter(ev => {
      const status = computeEventStatus(ev.event_date, ev.event_time)
      return status === 'Upcoming' || status === 'Live'
    })
    .map(ev => (
      <option key={ev.id} value={String(ev.id)}>{ev.title}</option>
    ))
  }
</select>
{selectedEventTitle && (
  <p className="mt-2 text-xs text-[#4fd1c5]">
    {urlEventId
      ? <>Just created: <span className="font-semibold">{selectedEventTitle}</span> — you can change it above.</>
      : <>Showing departments for: <span className="font-semibold">{selectedEventTitle}</span></>
    }
  </p>
)}
{events.filter(ev => computeEventStatus(ev.event_date, ev.event_time) === 'Upcoming' || computeEventStatus(ev.event_date, ev.event_time) === 'Live').length === 0 && !urlEventId && (
  <p className="mt-2 text-xs text-[#9ca3af]">No upcoming or live events available. Create an event first to add departments.</p>
)}
          </div>
        )}

        {/* Create Department Form */}
        {showForm && (
          <div className="bg-[#161b22]/80 border border-[#4fd1c5]/20 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              {activeTab === 'event'
                ? `New Department for "${selectedEventTitle || 'selected event'}"`
                : 'New General Department'}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  label="Department Name"
                  placeholder="e.g. Decoration, Logistics, Marketing"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#9ca3af] mb-1">
                  Department Head <span className="text-[#9ca3af] font-normal">(optional)</span>
                </label>
                {users.filter(u => u.role === 'DEPT_HEAD').length === 0 ? (
                  <div className="bg-[#0d1117] border border-[#30363d] text-[#9ca3af] text-sm rounded-lg px-4 py-2.5 w-full">
                    No department heads available. Create one first.
                  </div>
                ) : (
                  <select
                    value={formData.head_id}
                    onChange={e => setFormData({ ...formData, head_id: e.target.value })}
                    className="bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  >
                    <option value="">Assign later</option>
                    {users.filter(u => u.role === 'DEPT_HEAD').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#30363d] text-sm text-[#9ca3af] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Department List */}
        {loading ? (
          <div className="text-center text-[#9ca3af] py-20">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="text-center text-[#9ca3af] py-20">
            {activeTab === 'event' && !selectedEventId
              ? 'Select an event above to view its departments.'
              : 'No departments yet. Click "Add Department" to create one.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {departments.map(dept => (
              <div
                key={dept.id}
                className="bg-[#161b22]/80 border border-[#30363d] rounded-xl p-5 hover:border-[#4fd1c5]/30 transition-colors relative"
              >
                {/* 3-dot menu button */}
                <div ref={menuRef} className="absolute top-3 right-3">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === dept.id ? null : dept.id)}
                    className="w-8 h-8 rounded-full bg-[#2d5f5d]/20 hover:bg-[#2d5f5d]/40 flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {menuOpenId === dept.id && (
                    <div className="absolute right-0 top-10 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl py-1 min-w-[140px] z-10">
                      <button
                        onClick={() => {
                          setEditingDeptId(dept.id)
                          setEditingDeptName(dept.name)
                          setMenuOpenId(null)
                        }}
                        className="w-full px-3 py-2 text-sm flex items-center gap-2 text-white hover:bg-[#0d1117] transition-colors"
                      >
                        <Pencil size={14} className="text-[#9ca3af]" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="w-full px-3 py-2 text-sm flex items-center gap-2 text-red-400 hover:bg-[#0d1117] transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit mode */}
                {editingDeptId === dept.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingDeptName}
                      onChange={e => setEditingDeptName(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-[#4fd1c5] transition-colors"
                      placeholder="Department name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dept.id)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#2d5f5d] text-white text-sm hover:bg-[#2d5f5d]/80 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingDeptId(null)
                          setEditingDeptName('')
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-[#30363d] text-[#9ca3af] text-sm hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#4fd1c5]" />
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">{dept.name}</h3>
                    <p className="text-xs text-[#9ca3af]">
                      Head: {dept.head_id
                        ? users.find(u => u.id === dept.head_id)?.name || 'Assigned'
                        : 'Not assigned'}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
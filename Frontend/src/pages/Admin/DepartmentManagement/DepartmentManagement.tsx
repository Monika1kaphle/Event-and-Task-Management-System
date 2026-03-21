import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Plus, Building2, CalendarDays, Trash2, ArrowLeft } from 'lucide-react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'

interface DepartmentManagementProps {
  onLogout: () => void
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

  // Fetch users (for head selection)
  useEffect(() => {
    axios.get('http://localhost:3000/api/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
  }, [])

  // Fetch events list (for event tab dropdown)
  useEffect(() => {
    axios.get('http://localhost:3000/api/events')
      .then(res => setEvents(res.data))
      .catch(console.error)
  }, [])

  // Fetch departments based on active tab
  useEffect(() => {
    setLoading(true)
    const url = activeTab === 'event' && selectedEventId
      ? `http://localhost:3000/api/departments/event/${selectedEventId}`
      : activeTab === 'general'
      ? 'http://localhost:3000/api/departments'
      : null

    if (!url) { setLoading(false); setDepartments([]); return }

    axios.get(url)
      .then(res => { setDepartments(res.data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [activeTab, selectedEventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        head_id: formData.head_id || null,
        event_id: activeTab === 'event' ? selectedEventId || null : null
      }
      await axios.post('http://localhost:3000/api/departments', payload)
      setFormData({ name: '', head_id: '' })
      setShowForm(false)
      // Refresh
      const url = activeTab === 'event' && selectedEventId
        ? `http://localhost:3000/api/departments/event/${selectedEventId}`
        : 'http://localhost:3000/api/departments'
      const res = await axios.get(url)
      setDepartments(res.data)
    } catch (err) {
      console.error(err)
      alert('Failed to create department')
    } finally {
      setIsSubmitting(false)
    }
  }

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
  {events.map(ev => (
    <option key={ev.id} value={String(ev.id)}>{ev.title}</option>
  ))}
</select>
{selectedEventTitle && (
  <p className="mt-2 text-xs text-[#4fd1c5]">
    {urlEventId
      ? <>Just created: <span className="font-semibold">{selectedEventTitle}</span> — you can change it above.</>
      : <>Showing departments for: <span className="font-semibold">{selectedEventTitle}</span></>
    }
  </p>
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
                <select
                  value={formData.head_id}
                  onChange={e => setFormData({ ...formData, head_id: e.target.value })}
                  className="bg-[#0d1117] border border-[#30363d] text-white text-sm rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-[#4fd1c5] transition-colors"
                >
                  <option value="">Assign later</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
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
                className="bg-[#161b22]/80 border border-[#30363d] rounded-xl p-5 hover:border-[#4fd1c5]/30 transition-colors"
              >
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
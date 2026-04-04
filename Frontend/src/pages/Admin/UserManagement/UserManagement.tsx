import { useState, useEffect } from 'react'
import { Sidebar } from '../../../components/layout/Sidebar'
import {
  Search, Bell, UserPlus, Users, Info, Pencil, Trash2, CheckCircle, XCircle, Loader2
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  department_id: number | null
  role_title: string | null
  status: string
}

interface Department {
  id: number
  name: string
  department_name?: string
  display_name?: string
  event_id?: number | null
  event_title?: string | null
}

interface UserManagementProps {
  onLogout: () => void
}

export function UserManagement({ onLogout }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [filter, setFilter] = useState<'All' | 'Pending'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Dept head form
  const [deptHeadForm, setDeptHeadForm] = useState({ name: '', email: '', departmentId: '' })
  const [deptHeadLoading, setDeptHeadLoading] = useState(false)
  const [deptHeadMsg, setDeptHeadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Member form
  const [memberForm, setMemberForm] = useState({ name: '', email: '', roleTitle: '', departmentId: '' })
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberMsg, setMemberMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('http://localhost:3000/api/users', { headers })
      if (res.ok) setUsers(await res.json())
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch departments for dropdowns
  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/departments/all-with-events', { headers })
      if (res.ok) setDepartments(await res.json())
    } catch (err) {
      console.error('Failed to fetch departments', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [])

  // Invite dept head
  const handleInviteDeptHead = async () => {
    if (!deptHeadForm.name || !deptHeadForm.email || !deptHeadForm.departmentId) {
      setDeptHeadMsg({ type: 'error', text: 'All fields are required.' })
      return
    }
    setDeptHeadLoading(true)
    setDeptHeadMsg(null)
    try {
      const res = await fetch('http://localhost:3000/api/users/invite-dept-head', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: deptHeadForm.name,
          email: deptHeadForm.email,
          departmentId: deptHeadForm.departmentId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setDeptHeadMsg({ type: 'success', text: data.message || 'Invitation sent!' })
        setDeptHeadForm({ name: '', email: '', departmentId: '' })
        fetchUsers()
      } else {
        setDeptHeadMsg({ type: 'error', text: data.error || 'Failed to send invitation.' })
      }
    } catch {
      setDeptHeadMsg({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setDeptHeadLoading(false)
    }
  }

  // Invite member
  const handleInviteMember = async () => {
    if (!memberForm.name || !memberForm.email || !memberForm.departmentId) {
      setMemberMsg({ type: 'error', text: 'Name, email and department are required.' })
      return
    }
    setMemberLoading(true)
    setMemberMsg(null)
    try {
      const res = await fetch('http://localhost:3000/api/users/invite-member', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: memberForm.name,
          email: memberForm.email,
          departmentId: memberForm.departmentId,
          roleTitle: memberForm.roleTitle || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMemberMsg({ type: 'success', text: data.message || 'Member invited!' })
        setMemberForm({ name: '', email: '', roleTitle: '', departmentId: '' })
        fetchUsers()
      } else {
        setMemberMsg({ type: 'error', text: data.error || 'Failed to invite member.' })
      }
    } catch {
      setMemberMsg({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setMemberLoading(false)
    }
  }

  // Delete user
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (res.ok) setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  // Get dept name by id
  const getDeptName = (id: number | null) => {
    if (!id) return '—'
    return departments.find(d => d.id === id)?.name || '—'
  }

  // Role badge style
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DEPT_HEAD': return 'bg-[#2d5f5d]/20 text-[#4fd1c5]'
      case 'MEMBER':    return 'bg-blue-500/10 text-blue-400'
      case 'ADMIN':     return 'bg-purple-500/10 text-purple-400'
      default:          return 'bg-gray-500/10 text-gray-400'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'DEPT_HEAD': return 'Dept Head'
      case 'MEMBER':    return 'Member'
      case 'ADMIN':     return 'Admin'
      case 'CLIENT':    return 'Client'
      default:          return role
    }
  }

  const filteredUsers = users.filter(user => {
    const isRelevantRole = user.role === 'DEPT_HEAD' || user.role === 'MEMBER'
    const matchesFilter = filter === 'All' || user.status === 'Pending OTP'
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDeptName(user.department_id).toLowerCase().includes(searchQuery.toLowerCase())
    return isRelevantRole && matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">

        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
            <p className="text-sm text-gray-400">Manage system roles, department heads, and team members.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#161b22] border border-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#4fd1c5] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#2d5f5d] flex items-center justify-center text-white text-sm font-medium border border-[#4fd1c5]/30">
              AD
            </div>
          </div>
        </header>

        {/* Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Add Department Head */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#4fd1c5]" />
              </div>
              <h2 className="text-lg font-semibold">Add Department Head</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={deptHeadForm.name}
                  onChange={e => setDeptHeadForm({ ...deptHeadForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={deptHeadForm.email}
                  onChange={e => setDeptHeadForm({ ...deptHeadForm, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Department</label>
                <select
                  value={deptHeadForm.departmentId}
                  onChange={e => setDeptHeadForm({ ...deptHeadForm, departmentId: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.display_name || d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2 bg-[#2d5f5d]/10 border border-[#2d5f5d]/30 rounded-lg p-3">
                <Info className="w-4 h-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4fd1c5]">System will generate an OTP and email it to the user.</p>
              </div>

              {/* Feedback */}
              {deptHeadMsg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 ${
                  deptHeadMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {deptHeadMsg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  {deptHeadMsg.text}
                </div>
              )}

              <button
                onClick={handleInviteDeptHead}
                disabled={deptHeadLoading}
                className="w-full bg-[#2d5f5d] hover:bg-[#3a7a77] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {deptHeadLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  : 'Invite Department Head'}
              </button>
            </div>
          </div>

          {/* Add Team Member */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">Add Team Member</h2>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={memberForm.name}
                    onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Designer"
                    value={memberForm.roleTitle}
                    onChange={e => setMemberForm({ ...memberForm, roleTitle: e.target.value })}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={memberForm.email}
                  onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Department</label>
                <select
                  value={memberForm.departmentId}
                  onChange={e => setMemberForm({ ...memberForm, departmentId: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4fd1c5] transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.display_name || d.name}</option>
                  ))}
                </select>
              </div>

              {/* Feedback */}
              {memberMsg && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 ${
                  memberMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {memberMsg.type === 'success'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  {memberMsg.text}
                </div>
              )}

              <div className="mt-auto pt-2">
                <button
                  onClick={handleInviteMember}
                  disabled={memberLoading}
                  className="w-full border border-blue-500 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {memberLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : 'Register Member'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Directory Table */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold">User Directory</h2>
            <div className="flex bg-[#0d1117] rounded-full p-1 border border-gray-800">
              <button
                onClick={() => setFilter('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'All' ? 'bg-[#2d5f5d] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'Pending' ? 'bg-[#2d5f5d] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Pending
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">No users found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0d1117] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{getDeptName(user.department_id)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-[#4fd1c5]' : 'bg-yellow-500'}`} />
                        <span className={`text-sm ${user.status === 'active' ? 'text-[#4fd1c5]' : 'text-yellow-500'}`}>
                          {user.status === 'active' ? 'Active' : 'Pending OTP'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-gray-400 hover:text-[#4fd1c5]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
import  { useState } from 'react'
import { Sidebar } from '../../../components/layout/Sidebar' // Import Sidebar
import {
  Search,
  Bell,
  UserPlus,
  Users,
  Info,
  Pencil,
  Trash2,
} from 'lucide-react'

// Types
interface User {
  id: number
  name: string
  role: 'DEPT HEAD' | 'MEMBER'
  department: string
  status: 'Active' | 'Pending OTP'
}

interface UserManagementProps {
  onLogout: () => void
}

const MOCK_USERS: User[] = [
  { id: 1, name: 'Alexandra Chen', role: 'DEPT HEAD', department: 'Design', status: 'Active' },
  { id: 2, name: 'Marcus Johnson', role: 'DEPT HEAD', department: 'Marketing', status: 'Active' },
  { id: 3, name: 'Priya Patel', role: 'MEMBER', department: 'Logistics', status: 'Pending OTP' },
  { id: 4, name: 'David Kim', role: 'DEPT HEAD', department: 'Finance', status: 'Active' },
  { id: 5, name: 'Sarah Williams', role: 'MEMBER', department: 'Design', status: 'Active' },
  { id: 6, name: 'James Rodriguez', role: 'MEMBER', department: 'Customer Support', status: 'Pending OTP' },
  { id: 7, name: 'Emily Thompson', role: 'DEPT HEAD', department: 'Customer Support', status: 'Active' },
  { id: 8, name: 'Raj Mehta', role: 'MEMBER', department: 'Marketing', status: 'Pending OTP' },
]

const DEPARTMENTS = ['Design', 'Marketing', 'Logistics', 'Finance', 'Customer Support']

export function UserManagement({ onLogout }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [filter, setFilter] = useState<'All' | 'Pending'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [deptHeadForm, setDeptHeadForm] = useState({ name: '', email: '', department: '' })
  const [memberForm, setMemberForm] = useState({ name: '', designation: '', email: '', department: '' })

  const handleAddDeptHead = () => {
    if (!deptHeadForm.name || !deptHeadForm.department) return
    const newUser: User = {
      id: Date.now(),
      name: deptHeadForm.name,
      role: 'DEPT HEAD',
      department: deptHeadForm.department,
      status: 'Pending OTP'
    }
    setUsers([newUser, ...users])
    setDeptHeadForm({ name: '', email: '', department: '' })
  }

  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.department) return
    const newUser: User = {
      id: Date.now(),
      name: memberForm.name,
      role: 'MEMBER',
      department: memberForm.department,
      status: 'Pending OTP'
    }
    setUsers([newUser, ...users])
    setMemberForm({ name: '', designation: '', email: '', department: '' })
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id))
  }

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'All' || user.status === 'Pending OTP'
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar - Fixed Width 256px (w-64) */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main Content - Margin matches Sidebar width exactly */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
            <p className="text-sm text-gray-400">
              Manage system roles, department heads, and team members.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161b22] border border-gray-800 text-white text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#4fd1c5] rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#2d5f5d] flex items-center justify-center text-white text-sm font-medium border border-[#4fd1c5]/30">
              AD
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Add Department Head Card */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-sm">
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
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#4fd1c5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={deptHeadForm.email}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#4fd1c5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Department</label>
                <select
                  value={deptHeadForm.department}
                  onChange={(e) => setDeptHeadForm({ ...deptHeadForm, department: e.target.value })}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#4fd1c5] cursor-pointer"
                >
                  <option value="" disabled>Select Department</option>
                  {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="flex items-start gap-2 bg-[#2d5f5d]/10 border border-[#2d5f5d]/30 rounded-lg p-3">
                <Info className="w-4 h-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4fd1c5]">System will generate an OTP and email it to the user.</p>
              </div>
              <button onClick={handleAddDeptHead} className="w-full bg-[#2d5f5d] hover:bg-[#3a7a77] text-white font-medium py-2.5 rounded-lg transition-all">
                Invite Department Head
              </button>
            </div>
          </div>

          {/* Add Team Member Card */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">Add Team Member</h2>
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Role Title"
                  value={memberForm.designation}
                  onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
                  className="bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none"
              />
              <select
                value={memberForm.department}
                onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <div className="mt-auto pt-6">
                <button onClick={handleAddMember} className="w-full border border-blue-500 text-blue-400 hover:bg-blue-500/10 font-medium py-2.5 rounded-lg transition-all">
                  Register Member
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

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0d1117] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/20 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'DEPT HEAD' ? 'bg-[#2d5f5d]/20 text-[#4fd1c5]' : 'bg-blue-500/10 text-blue-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-[#4fd1c5]' : 'bg-yellow-500'}`}></span>
                      <span className={`text-sm ${user.status === 'Active' ? 'text-[#4fd1c5]' : 'text-yellow-500'}`}>{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-400 hover:text-[#4fd1c5]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
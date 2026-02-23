import React, { useState } from 'react'
import {
  Search,
  Bell,
  Settings,
  UserPlus,
  Users,
  Info,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react'

// Types
interface User {
  id: number
  name: string
  role: 'DEPT HEAD' | 'MEMBER'
  department: string
  status: 'Active' | 'Pending OTP'
}

// Mock Data
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Alexandra Chen',
    role: 'DEPT HEAD',
    department: 'Design',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'DEPT HEAD',
    department: 'Marketing',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'MEMBER',
    department: 'Logistics',
    status: 'Pending OTP',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'DEPT HEAD',
    department: 'Finance',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Sarah Williams',
    role: 'MEMBER',
    department: 'Design',
    status: 'Active',
  },
  {
    id: 6,
    name: 'James Rodriguez',
    role: 'MEMBER',
    department: 'Customer Support',
    status: 'Pending OTP',
  },
  {
    id: 7,
    name: 'Emily Thompson',
    role: 'DEPT HEAD',
    department: 'Customer Support',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Raj Mehta',
    role: 'MEMBER',
    department: 'Marketing',
    status: 'Pending OTP',
  },
]

const DEPARTMENTS = [
  'Design',
  'Marketing',
  'Logistics',
  'Finance',
  'Customer Support',
]

export function UserManagement() {
  // State
  const [users, setUsers] = useState<User[]>(MOCK_USERS) // Moved to state to allow updates
  const [filter, setFilter] = useState<'All' | 'Pending'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Form States (Controlled Inputs)
  const [deptHeadForm, setDeptHeadForm] = useState({
    name: '',
    email: '',
    department: '',
  })

  const [memberForm, setMemberForm] = useState({
    name: '',
    designation: '',
    email: '',
    department: '',
  })

  // --- Logic Handlers ---

  const handleAddDeptHead = () => {
    if (!deptHeadForm.name || !deptHeadForm.department) return;
    
    const newUser: User = {
      id: Date.now(),
      name: deptHeadForm.name,
      role: 'DEPT HEAD',
      department: deptHeadForm.department,
      status: 'Pending OTP'
    };

    setUsers([newUser, ...users]);
    setDeptHeadForm({ name: '', email: '', department: '' }); // Reset
  }

  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.department) return;

    const newUser: User = {
      id: Date.now(),
      name: memberForm.name,
      role: 'MEMBER',
      department: memberForm.department,
      status: 'Pending OTP'
    };

    setUsers([newUser, ...users]);
    setMemberForm({ name: '', designation: '', email: '', department: '' }); // Reset
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  }

  // Filtered and Searched Users
  const filteredUsers = users
    .filter((user) => {
      const matchesFilter = filter === 'All' || user.status === 'Pending OTP';
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })

  return (
    <div className="flex-1 min-h-screen bg-[#0d1117] p-8 ml-[240px]">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            User Management
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Manage system roles, department heads, and team members.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#161b22] border border-[#30363d] text-white text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-[#4fd1c5] transition-colors"
            />
          </div>

          {/* Icons */}
          <button className="p-2 text-[#9ca3af] hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#4fd1c5] rounded-full"></span>
          </button>
          <button className="p-2 text-[#9ca3af] hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#2d5f5d] flex items-center justify-center text-white text-sm font-medium border border-[#4fd1c5]/30">
            AD
          </div>
        </div>
      </header>

      {/* Creation Section - Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Card: Add Department Head */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#2d5f5d] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#4fd1c5]" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Add Department Head
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={deptHeadForm.name}
                onChange={(e) =>
                  setDeptHeadForm({
                    ...deptHeadForm,
                    name: e.target.value,
                  })
                }
                placeholder="Enter full name"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={deptHeadForm.email}
                onChange={(e) =>
                  setDeptHeadForm({
                    ...deptHeadForm,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Department
              </label>
              <div className="relative">
                <select
                  value={deptHeadForm.department}
                  onChange={(e) =>
                    setDeptHeadForm({
                      ...deptHeadForm,
                      department: e.target.value,
                    })
                  }
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white appearance-none focus:outline-none focus:border-[#4fd1c5] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 bg-[#2d5f5d]/10 border border-[#2d5f5d]/30 rounded-lg p-3 mt-2">
              <Info className="w-4 h-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4fd1c5] leading-relaxed">
                System will generate a One-Time Password (OTP) and email it to
                the user.
              </p>
            </div>

            <button 
              onClick={handleAddDeptHead}
              className="w-full bg-[#2d5f5d] hover:bg-[#3a7a77] text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              Invite Department Head
            </button>
          </div>
        </div>

        {/* Right Card: Add Team Member */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#60a5fa]" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Add Team Member
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full Name"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={memberForm.designation}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      designation: e.target.value,
                    })
                  }
                  placeholder="Role Title"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4fd1c5] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={memberForm.email}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#4fd1c5] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Department
              </label>
              <div className="relative">
                <select
                  value={memberForm.department}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      department: e.target.value,
                    })
                  }
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white appearance-none focus:outline-none focus:border-[#4fd1c5] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="pt-2"></div>{' '}
            {/* Spacer to align buttons roughly if needed, or just margin */}
            <button 
              onClick={handleAddMember}
              className="w-full border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 font-medium py-2.5 rounded-lg transition-colors mt-auto"
            >
              Register Member
            </button>
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-[#30363d] flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-white">User Directory</h2>

          <div className="flex bg-[#0d1117] rounded-full p-1 border border-[#30363d]">
            <button
              onClick={() => setFilter('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'All' ? 'bg-[#2d5f5d] text-white shadow-sm' : 'text-[#9ca3af] hover:text-white'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('Pending')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === 'Pending' ? 'bg-[#2d5f5d] text-white shadow-sm' : 'text-[#9ca3af] hover:text-white'}`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d1117] border-b border-[#30363d]">
                <th className="px-6 py-4 text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[#9ca3af] text-xs font-semibold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/50">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#1f2937]/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium text-sm">
                      {user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${user.role === 'DEPT HEAD' ? 'bg-[#2d5f5d]/20 text-[#4fd1c5] border border-[#2d5f5d]/50' : 'bg-[#1e3a5f]/30 text-[#60a5fa] border border-[#1e3a5f]/50'}
                    `}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#9ca3af] text-sm">
                      {user.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.status === 'Active' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#4fd1c5]"></span>
                          <span className="text-[#4fd1c5] text-sm font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                          </span>
                          <span className="text-[#fbbf24] text-sm font-medium">
                            Pending OTP
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="text-[#9ca3af] hover:text-[#4fd1c5] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-[#9ca3af] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State if no users found */}
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-[#9ca3af]">
            No users found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}
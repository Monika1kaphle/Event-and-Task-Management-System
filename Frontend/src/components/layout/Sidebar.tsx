import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CheckSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  CalendarPlus,
  List,
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role

  const isEventSection = location.pathname.startsWith('/events')
  const [eventExpanded, setEventExpanded] = useState(isEventSection)

  // Menu items visibility based on role
  const showUserMgmt = userRole === 'ADMIN'
  const showDeptMgmt = userRole === 'ADMIN'
  const showEvents = userRole === 'ADMIN'
  const showDeptHeadMenu = userRole === 'DEPT_HEAD'

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1419] border-r border-gray-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-gray-800/50">
        <div className="h-8 w-8 rounded-lg bg-[#2d5f5d] flex items-center justify-center shadow-[0_0_15px_rgba(45,95,93,0.5)]">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">E&T</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">

        {/* Dashboard */}
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          path="/dashboard"
          currentPath={location.pathname}
          onClick={() => navigate('/dashboard')}
        />

        {/* User Management — Admin Only */}
        {showUserMgmt && (
          <NavItem
            icon={Users}
            label="User Management"
            path="/users"
            currentPath={location.pathname}
            onClick={() => navigate('/users')}
          />
        )}

        {/* Department Management — Admin Only */}
        {showDeptMgmt && (
          <NavItem
            icon={Building2}
            label="Department Management"
            path="/departments"
            currentPath={location.pathname}
            onClick={() => navigate('/departments')}
          />
        )}

        {/* Event Management — Admin & Dept Head */}
        {showEvents && (
          <div>
            <button
              onClick={() => setEventExpanded(!eventExpanded)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isEventSection
                  ? 'bg-[#2d5f5d]/10 text-[#2d5f5d] border-l-2 border-[#2d5f5d]'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calendar className={`h-5 w-5 ${isEventSection ? 'text-[#2d5f5d]' : 'text-gray-500'}`} />
                <span>Event Management</span>
              </div>
              {eventExpanded
                ? <ChevronDown size={16} className="text-gray-500" />
                : <ChevronRight size={16} className="text-gray-500" />
              }
            </button>

            {eventExpanded && (
              <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-800/50 pl-4">
                <button
                  onClick={() => navigate('/events')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    location.pathname === '/events'
                      ? 'text-[#4fd1c5] bg-[#2d5f5d]/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <List size={16} />
                  <span>All Events</span>
                </button>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/events/create')}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      location.pathname === '/events/create'
                        ? 'text-[#4fd1c5] bg-[#2d5f5d]/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <CalendarPlus size={16} />
                    <span>Post Event</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Task Management — Admin Only */}
        {userRole === 'ADMIN' && (
          <NavItem
            icon={CheckSquare}
            label="Task Management"
            path="/tasks"
            currentPath={location.pathname}
            onClick={() => navigate('/tasks')}
          />
        )}

        {/* Department Head Menu — Dept Head Only */}
        {showDeptHeadMenu && (
          <>
            <NavItem
              icon={CheckSquare}
              label="Task Management"
              path="/tasks"
              currentPath={location.pathname}
              onClick={() => navigate('/tasks')}
            />
            <NavItem
              icon={Users}
              label="Member Management"
              path="/members"
              currentPath={location.pathname}
              onClick={() => navigate('/members')}
            />
          </>
        )}

      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-800/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

// Reusable nav item to avoid repetition
function NavItem({
  icon: Icon,
  label,
  path,
  currentPath,
  onClick,
}: {
  icon: any
  label: string
  path: string
  currentPath: string
  onClick: () => void
}) {
  const isActive = currentPath === path
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[#2d5f5d]/10 text-[#2d5f5d] border-l-2 border-[#2d5f5d]'
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border-l-2 border-transparent'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-[#2d5f5d]' : 'text-gray-500'}`} />
      <span>{label}</span>
    </button>
  )
}
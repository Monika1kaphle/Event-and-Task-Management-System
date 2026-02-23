import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CheckSquare,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'User Management', icon: Users, path: '/users' },
    { name: 'Department Management', icon: Building2, path: '/departments' },
    { name: 'Event Management', icon: Calendar, path: '/events' },
    { name: 'Task Management', icon: CheckSquare, path: '/tasks' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1419] border-r border-gray-800 flex flex-col z-50">

      <div className="p-6 flex items-center space-x-3 border-b border-gray-800/50">
        <div className="h-8 w-8 rounded-lg bg-[#2d5f5d] flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">E&T</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>

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
import React from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CheckSquare,
  LogOut,
} from 'lucide-react'
interface SidebarProps {
  activeItem?: string
  onNavigate: (item: string) => void
  onLogout: () => void
}
export function Sidebar({
  activeItem = 'Dashboard',
  onNavigate,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'User Management',
      icon: Users,
    },
    {
      name: 'Department Management',
      icon: Building2,
    },
    {
      name: 'Event Management',
      icon: Calendar,
    },
    {
      name: 'Task Management',
      icon: CheckSquare,
    },
  ]
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1419] border-r border-gray-800 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 flex items-center space-x-3 border-b border-gray-800/50">
        <div className="h-8 w-8 rounded-lg bg-[#2d5f5d] flex items-center justify-center shadow-[0_0_15px_rgba(45,95,93,0.5)]">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">E&T</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeItem === item.name
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-[#2d5f5d]/10 text-[#2d5f5d] border-l-2 border-[#2d5f5d]' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border-l-2 border-transparent'}
              `}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-[#2d5f5d]' : 'text-gray-500 group-hover:text-white'}`}
              />
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>

      {/* User / Logout */}
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

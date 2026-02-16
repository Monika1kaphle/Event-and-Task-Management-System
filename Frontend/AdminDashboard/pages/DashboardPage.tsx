import React, { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { AddDepartmentCard } from '../Components/Dashboard/AddDepartmentCard'
import { CalendarCard } from '../Components/Dashboard/CalendarCard'
import { DepartmentProgressCard } from '../Components/Dashboard/DepartmentProgressCard'
import { AssignTaskCard } from '../Components/Dashboard/AssignTaskCard'
import { PostEventCard } from '../Components/Dashboard/PostEventCard'
import { Bell, Search, Settings } from 'lucide-react'
interface DashboardPageProps {
  onLogout: () => void
}
export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeItem, setActiveItem] = useState('Dashboard')
  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, Admin</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#161b22] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#2d5f5d] w-64 transition-colors"
              />
            </div>
            <button className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#2d5f5d] shadow-[0_0_5px_#2d5f5d]" />
            </button>
            <button className="p-2 rounded-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2d5f5d] to-[#1a3a39] border-2 border-[#161b22] shadow-lg" />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[400px]">
            <div className="lg:col-span-1 h-full">
              <AddDepartmentCard />
            </div>
            <div className="lg:col-span-2 h-full">
              <CalendarCard />
            </div>
            <div className="lg:col-span-1 h-full">
              <DepartmentProgressCard />
            </div>
          </div>

          {/* Middle Section */}
          <div className="w-full">
            <AssignTaskCard />
          </div>

          {/* Bottom Section */}
          <div className="w-full pb-8">
            <PostEventCard />
          </div>
        </div>
      </main>
    </div>
  )
}

import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'

// --- IMPORTS ---
// Based on your file structure image:
import { Sidebar } from '../../../AdminDashboard/Sidebar' // Go up one level to components/Sidebar.tsx

// Accessing the external AdminDashboard folder (3 levels up)
import { AddDepartmentCard }from '../../../AdminDashboard/Components/Dashboard/AddDepartmentCard'
import { CalendarCard } from '../../../AdminDashboard/Components/Dashboard/CalendarCard'
import { DepartmentProgressCard } from '../../../AdminDashboard/Components/Dashboard/DepartmentProgressCard'
import { AssignTaskCard } from '../../../AdminDashboard/Components/Dashboard/AssignTaskCard'
import { PostEventCard } from '../../../AdminDashboard/Components/Dashboard/PostEventCard'

interface DashboardPageProps {
  onLogout: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [activeItem, setActiveItem] = useState('Dashboard')

  return (
    // MAIN CONTAINER
    <div className="min-h-screen bg-[#0f1419] text-white font-sans selection:bg-[#2d5f5d] selection:text-white">
      
      {/* 1. SIDEBAR (Fixed Position) 
          This forces the sidebar to stick to the left and never shrink.
      */}
      <div className="fixed left-0 top-0 h-full w-64 z-50">
        <Sidebar 
          activeItem={activeItem} 
          onNavigate={setActiveItem} 
          onLogout={onLogout} 
        />
      </div>

      {/* 2. MAIN CONTENT AREA 
          'ml-64' creates a 256px margin on the left so content doesn't 
          hide behind the sidebar.
      */}
      <main className="ml-64 p-8 min-h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, Admin</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#2d5f5d] transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#161b22] border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#2d5f5d] w-64 transition-all shadow-sm"
              />
            </div>

            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-[#161b22] rounded-full transition-all relative border border-transparent hover:border-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-[#2d5f5d] rounded-full shadow-[0_0_8px_#2d5f5d]"></span>
            </button>
            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-[#161b22] rounded-full transition-all border border-transparent hover:border-gray-800">
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2d5f5d] to-[#1a3a39] border border-[#2d5f5d]/50 flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer">
              AD
            </div>
          </div>
        </header>

        {/* 3. DASHBOARD GRID (The Layout Fix) */}
        <div className="grid grid-cols-12 gap-6 pb-10">
          
          {/* --- TOP ROW --- */}
          
          {/* Add Department: 3 Columns */}
          <div className="col-span-12 lg:col-span-3 flex flex-col">
             <div className="h-full">
                <AddDepartmentCard />
             </div>
          </div>

          {/* Calendar: 6 Columns (The Centerpiece) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col">
             <div className="h-full">
                <CalendarCard />
             </div>
          </div>

          {/* Progress: 3 Columns */}
          <div className="col-span-12 lg:col-span-3 flex flex-col">
             <div className="h-full">
                <DepartmentProgressCard />
             </div>
          </div>

          {/* --- MIDDLE ROW --- */}
          
          {/* Assign Task: Full Width */}
          <div className="col-span-12">
            <AssignTaskCard />
          </div>

          {/* --- BOTTOM ROW --- */}

          {/* Post Event: Full Width */}
          <div className="col-span-12">
            <PostEventCard />
          </div>

        </div>
      </main>
    </div>
  )
}
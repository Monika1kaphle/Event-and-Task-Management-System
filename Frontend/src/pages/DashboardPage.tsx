import { Sidebar } from '../components/layout/Sidebar'
import { AddDepartmentCard } from '../components/dashboard/AddDepartmentCard'
import { CalendarCard } from '../components/dashboard/CalendarCard'
import { DepartmentProgressCard } from '../components/dashboard/DepartmentProgressCard'
import { AssignTaskCard } from '../components/dashboard/AssignTaskCard'
import { PostEventCard } from '../components/dashboard/PostEventCard'

interface DashboardPageProps {
  onLogout: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar - Fixed Width */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Managing Departments & Staff</p>
        </header>

        <div className="space-y-6">
          {/* Top Row: Using a 12-column grid for better distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-3">
              <AddDepartmentCard />
            </div>
            <div className="lg:col-span-5">
              <CalendarCard />
            </div>
            <div className="lg:col-span-4">
              <DepartmentProgressCard />
            </div>
          </div>

          {/* Middle Row: Full Width Task Assignment */}
          <AssignTaskCard />

          {/* Bottom Row: Post Event */}
          <div className="pb-8">
            <PostEventCard />
          </div>
        </div>
      </main>
    </div>
  )
}
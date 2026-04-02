import { Sidebar } from '../../../components/layout/Sidebar'
import { useNavigate } from 'react-router-dom'
// BarChart3 can be removed from imports if not used elsewhere
import { AddDepartmentCard } from '../../../components/dashboard/AddDepartmentCard'
import { CalendarCard } from '../../../components/dashboard/CalendarCard'
import { DepartmentProgressCard } from '../../../components/dashboard/DepartmentProgressCard'
import { AssignTaskCard } from '../../../components/dashboard/AssignTaskCard'
import { PostEventCard } from '../../../components/dashboard/PostEventCard'

interface DashboardPageProps {
  onLogout: () => void
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f1419] text-white flex overflow-hidden">
      {/* Sidebar - Fixed Width */}
      <div className="w-64 fixed inset-y-0 left-0 z-50">
        <Sidebar onLogout={onLogout} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto custom-scrollbar" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="mb-8 flex justify-between items-start flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm">Managing Departments & Staff</p>
          </div>
          {/* Button removed from here */}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          {/* Top Row: Using a 12-column grid for better distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <AddDepartmentCard />
            </div>
            <div>
              <CalendarCard />
            </div>
            <div>
              <DepartmentProgressCard />
            </div>
          </div>

          {/* Middle Row: Full Width Task Assignment */}
          <div style={{ width: '100%', flexShrink: 0 }}>
            <AssignTaskCard />
          </div>

          {/* Bottom Row: Full Width Post Event */}
          <div style={{ width: '100%', flexShrink: 0, paddingBottom: '32px' }}>
            <PostEventCard />
          </div>
        </div>
      </main>
    </div>
  )
}
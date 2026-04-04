import { TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export function DepartmentProgressCard() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [averageProgress, setAverageProgress] = useState(0)

  useEffect(() => {
    const fetchDepartmentProgress = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard')
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Department progress fetched:', data.departmentProgress)
          
          if (data.departmentProgress && data.departmentProgress.length > 0) {
            setDepartments(data.departmentProgress)
            
            // Calculate average
            const avg = Math.round(
              data.departmentProgress.reduce((acc: number, curr: any) => acc + curr.percentage, 0) /
                data.departmentProgress.length
            )
            setAverageProgress(avg)
          }
        }
      } catch (err) {
        console.error('Failed to fetch department progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartmentProgress()
  }, [])

  if (loading) {
    return (
      <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl flex items-center justify-center">
        <p className="text-[#9ca3af]">Loading departments...</p>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl flex items-center justify-center">
        <p className="text-[#9ca3af]">No departments yet</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Department Progress - Top 5
        </h3>
        <div className="flex items-center text-[#2d5f5d] text-sm font-medium">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>Avg: {averageProgress}%</span>
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {departments.map((dept) => (
          <div key={dept.name} className="group">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {dept.name}
              </span>
              <span className="text-gray-400 font-mono">{dept.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d5f5d] rounded-full shadow-[0_0_10px_#2d5f5d] transition-all duration-1000 ease-out group-hover:brightness-110"
                style={{
                  width: `${dept.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
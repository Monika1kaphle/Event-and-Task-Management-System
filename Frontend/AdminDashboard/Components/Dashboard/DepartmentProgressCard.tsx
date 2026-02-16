import { TrendingUp } from 'lucide-react'
export function DepartmentProgressCard() {
  const departments = [
    {
      name: 'Design',
      progress: 78,
    },
    {
      name: 'Marketing',
      progress: 64,
    },
    {
      name: 'Logistics',
      progress: 92,
    },
    {
      name: 'Finance',
      progress: 45,
    },
    {
      name: 'Customer Support',
      progress: 83,
    },
  ]
  const averageProgress = Math.round(
    departments.reduce((acc, curr) => acc + curr.progress, 0) /
      departments.length,
  )
  return (
    <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Department Progress
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
              <span className="text-gray-400 font-mono">{dept.progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d5f5d] rounded-full shadow-[0_0_10px_#2d5f5d] transition-all duration-1000 ease-out group-hover:brightness-110"
                style={{
                  width: `${dept.progress}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

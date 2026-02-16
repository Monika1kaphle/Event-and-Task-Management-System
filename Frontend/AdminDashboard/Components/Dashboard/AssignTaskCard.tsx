import React, { useState, useEffect } from 'react'
import { CheckSquare, UserPlus } from 'lucide-react'
import { Input } from '../../UI/Input'
import { Select } from '../../UI/Select'
import { Button } from '../../UI/Button'

export function AssignTaskCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [dbDepartments, setDbDepartments] = useState<{ value: string; label: string }[]>([])
  
  // State for form fields
  const [taskData, setTaskData] = useState({
    department_id: '',
    assigned_to_id: '',
    title: '',
    description: '',
    deadline: ''
  })

  // --- NEW: Fetch Departments from Database on load ---
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/departments')
        if (response.ok) {
          const data = await response.json()
          // Transform DB data [ {id: 1, name: 'Design'} ] -> [ {value: '1', label: 'Design'} ]
          const formatted = data.map((d: any) => ({
            value: d.id.toString(),
            label: d.name
          }))
          setDbDepartments(formatted)
        }
      } catch (err) {
        console.error("Failed to load departments:", err)
      }
    }
    fetchDepts()
  }, [])

  const handleChange = (field: string, value: string) => {
    setTaskData({ ...taskData, [field]: value })
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/admin/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      const resJson = await response.json()

      if (response.ok) {
        alert('Task Assigned Successfully!')
        setTaskData({ department_id: '', assigned_to_id: '', title: '', description: '', deadline: '' })
      } else {
        alert('Error: ' + resJson.error)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
          <UserPlus className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Assign Task to Department Heads
        </h3>
      </div>

      <form
        onSubmit={handleAssign}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
      >
        <Select
          label="Department"
          value={taskData.department_id}
          onChange={(e) => handleChange('department_id', e.target.value)}
          options={dbDepartments} // <--- DYNAMIC DATA FROM DB
        />
        
        <Select
          label="Department Head"
          value={taskData.assigned_to_id}
          onChange={(e) => handleChange('assigned_to_id', e.target.value)}
          options={[
            { value: '1', label: 'John Doe' }, 
            { value: '2', label: 'Jane Smith' },
          ]}
        />

        <div className="md:col-span-2">
           <Input 
             label="Task Title" 
             placeholder="Review Q3 Goals"
             value={taskData.title}
             onChange={(e) => handleChange('title', e.target.value)}
           />
        </div>

        <div className="md:col-span-2">
           <Input 
             label="Description" 
             placeholder="Task details..."
             value={taskData.description}
             onChange={(e) => handleChange('description', e.target.value)}
           />
        </div>

        <div className="md:col-span-1">
           <Input 
             type="date"
             label="Deadline" 
             value={taskData.deadline}
             onChange={(e) => handleChange('deadline', e.target.value)}
           />
        </div>

        <div className="md:col-span-1">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="mb-[2px]"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        </div>
      </form>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { CheckSquare, UserPlus, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'

export function AssignTaskCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [dbDepartments, setDbDepartments] = useState<{ value: string; label: string }[]>([])
  
  // States for Popup Messages
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [taskData, setTaskData] = useState({
    department_id: '',
    assigned_to_id: '',
    title: '',
    description: '',
    deadline: ''
  })

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/departments')
        if (response.ok) {
          const data = await response.json()
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

  // Auto-hide timers for popups
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleChange = (field: string, value: string) => {
    setTaskData({ ...taskData, [field]: value })
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:3000/api/admin/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      const resJson = await response.json()

      if (response.ok) {
        setSuccessMessage('Task Assigned Successfully!')
        setTaskData({ department_id: '', assigned_to_id: '', title: '', description: '', deadline: '' })
      } else {
        setErrorMessage(resJson.error || 'Failed to assign task')
      }
    } catch (err) {
      setErrorMessage('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  // --- POPUP PORTAL LOGIC ---
  const popup =
    successMessage || errorMessage
      ? ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => {
                setSuccessMessage('')
                setErrorMessage('')
              }}
            />

            {/* Success Popup */}
            {successMessage && (
              <div
                className="bg-[#161b22] border-2 border-[#2d5f5d] rounded-2xl max-w-md w-full"
                style={{
                  position: 'relative',
                  padding: '40px 20px',
                  boxShadow: '0 0 50px rgba(45,95,93,0.3)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <button
                  onClick={() => setSuccessMessage('')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  <X size={24} />
                </button>
                
                <div className="h-16 w-16 rounded-full bg-[#2d5f5d]/15 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-10 w-10 text-[#4fd1c5]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                <p className="text-base text-gray-300">{successMessage}</p>
              </div>
            )}

            {/* Error Popup */}
            {errorMessage && (
              <div
                className="bg-[#161b22] border-2 border-red-500/70 rounded-2xl max-w-md w-full"
                style={{
                  position: 'relative',
                  padding: '40px 20px',
                  boxShadow: '0 0 50px rgba(239,68,68,0.2)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <button
                  onClick={() => setErrorMessage('')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  <X size={24} />
                </button>
                
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
                <p className="text-base text-red-300">{errorMessage}</p>
              </div>
            )}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {popup}
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
            options={dbDepartments}
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
    </>
  )
}
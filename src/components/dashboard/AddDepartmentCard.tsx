import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import {
  Building2,
  Plus,
  CheckCircle2,
  X,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface User {
  id: number
  name: string
}

export function AddDepartmentCard() {
  const [deptName, setDeptName] = useState('')
  const [selectedHeadId, setSelectedHeadId] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const response = await fetch(
        'http://localhost:3000/api/admin/add-department',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: deptName,
            head_id: selectedHeadId || null,
          }),
        },
      )
      if (response.ok) {
        setSuccessMessage('Department created successfully!')
        setDeptName('')
        setSelectedHeadId('')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to add department')
      }
    } catch (error) {
      setErrorMessage('Error connecting to server')
    } finally {
      setIsLoading(false)
    }
  }

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
                {/* CLOSE BUTTON - FORCED TOP RIGHT */}
                <button
                  onClick={() => setSuccessMessage('')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <X size={24} />
                </button>
                
                <div className="h-16 w-16 rounded-full bg-[#2d5f5d]/15 flex items-center justify-center mb-5">
                  <CheckCircle2
                    className="h-10 w-10 text-[#4fd1c5]"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(79,209,197,0.5))' }}
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                <p className="text-base text-gray-300">{successMessage}</p>
              </div>
            )}

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
                {/* CLOSE BUTTON - FORCED TOP RIGHT */}
                <button
                  onClick={() => setErrorMessage('')}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <X size={24} />
                </button>
                
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                  <AlertCircle
                    className="h-10 w-10 text-red-500"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.5))' }}
                  />
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

      <div className="h-full bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300 group">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d] group-hover:bg-[#2d5f5d]/20 transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Add Department</h3>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            placeholder="Department Name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            className="bg-[#0f1419]/50"
          />

          <div className="relative group/select">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within/select:text-[#2d5f5d] transition-colors" />
            <select
              value={selectedHeadId}
              onChange={(e) => setSelectedHeadId(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-800 text-gray-300 text-sm rounded-lg block p-2.5 pl-10 focus:ring-[#2d5f5d] focus:border-[#2d5f5d] appearance-none transition-colors hover:border-gray-700 outline-none cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" style={{ backgroundColor: '#0f1419', color: '#9ca3af' }}>
                {users.length === 0 ? 'No Heads Found' : 'Select Head (Optional)'}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id} style={{ backgroundColor: '#0f1419', color: '#d1d5db' }}>
                  {user.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading} disabled={!deptName} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </form>
      </div>
    </>
  )
}
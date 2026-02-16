import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Building2, Plus, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { Input } from '../../ui/Input'   // CHECK: Ensure path is correct
import { Button } from '../../ui/Button' // CHECK: Ensure path is correct

// --- BULLETPROOF POPUP OVERLAY ---
function PopupOverlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  // We use createPortal to document.body to break out of any sidebar/div constraints
  // z-[999999] ensures it is on top of EVERYTHING
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      {children}
    </div>,
    document.body
  )
}

export function AddDepartmentCard() {
  const [deptName, setDeptName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // State for messages
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Auto-hide Success Message
  useEffect(() => {
    if (successMessage) {
      console.log("✅ Success message triggered:", successMessage); // DEBUG LOG
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-hide Error Message
  useEffect(() => {
    if (errorMessage) {
      console.log("❌ Error message triggered:", errorMessage); // DEBUG LOG
      const timer = setTimeout(() => setErrorMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim()) return

    setIsLoading(true)
    setErrorMessage('') // Clear previous errors

    try {
      console.log("Sending request to backend..."); 
      // Ensure this URL is exactly correct for your backend
      const response = await fetch(
        'http://localhost:3000/api/admin/add-department', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: deptName }),
        }
      )

      if (response.ok) {
        console.log("Backend responded OK");
        setSuccessMessage('Department created successfully!') // This triggers the popup
        setDeptName('')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to add department')
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setErrorMessage('Error connecting to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* --- SUCCESS POPUP --- */}
      {successMessage && (
        <PopupOverlay>
          <div className="relative bg-[#161b22] border-2 border-[#2d5f5d] p-8 rounded-2xl max-w-md w-full flex flex-col items-center text-center shadow-[0_0_50px_rgba(45,95,93,0.5)]">
            <button
              onClick={() => setSuccessMessage('')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-full bg-[#2d5f5d]/15 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-10 w-10 text-[#4fd1c5]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
            <p className="text-base text-gray-300">{successMessage}</p>
          </div>
        </PopupOverlay>
      )}

      {/* --- ERROR POPUP --- */}
      {errorMessage && (
        <PopupOverlay>
          <div className="relative bg-[#161b22] border-2 border-red-500/70 p-8 rounded-2xl max-w-md w-full flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <button
              onClick={() => setErrorMessage('')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
            <p className="text-base text-red-300">{errorMessage}</p>
          </div>
        </PopupOverlay>
      )}

      {/* --- MAIN CARD --- */}
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
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={!deptName}
            className="mt-2 bg-[#2d5f5d] hover:bg-[#367572]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </form>
      </div>
    </>
  )
}
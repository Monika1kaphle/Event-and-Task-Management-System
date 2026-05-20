import { useState } from 'react'
import { X } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userEmail: string
  onEditName: (newName: string) => void
}

export function ProfileModal({ isOpen, onClose, userName, userEmail, onEditName }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(userName)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!editedName.trim()) {
      alert('Name cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName }),
      })

      if (response.ok) {
        onEditName(editedName)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg w-96 p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-[#0f1419] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[#4fd1c5]"
                placeholder="Enter your name"
              />
            ) : (
              <p className="text-white bg-[#0f1419] border border-gray-700 rounded px-3 py-2">{editedName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <p className="text-gray-500 bg-[#0f1419] border border-gray-700 rounded px-3 py-2">{userEmail}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-[#4fd1c5] text-black px-4 py-2 rounded font-semibold hover:bg-[#3bb8ad] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedName(userName)
                  }}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#4fd1c5] text-black px-4 py-2 rounded font-semibold hover:bg-[#3bb8ad] transition-all"
              >
                Edit Name
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

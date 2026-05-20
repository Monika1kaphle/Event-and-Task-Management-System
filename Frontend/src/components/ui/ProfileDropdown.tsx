import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Lock, Mail } from 'lucide-react'

interface ProfileDropdownProps {
  userName: string
  userInitials: string
  userRole: string
  onLogout: () => void
  onOpenProfile: () => void
  onOpenChangePassword: () => void
  onOpenForgotPassword: () => void
}

export function ProfileDropdown({
  userName,
  userInitials,
  userRole,
  onLogout,
  onOpenProfile,
  onOpenChangePassword,
  onOpenForgotPassword,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    setIsOpen(false)
    onOpenProfile()
  }

  const handleChangePasswordClick = () => {
    setIsOpen(false)
    onOpenChangePassword()
  }

  const handleForgotPasswordClick = () => {
    setIsOpen(false)
    onOpenForgotPassword()
  }

  const handleLogoutClick = () => {
    setIsOpen(false)
    onLogout()
  }

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'CLIENT': 'User',
      'ADMIN': 'Administrator',
      'DEPT_HEAD': 'Department Head',
      'MEMBER': 'Team Member',
    }
    return roleMap[role] || role
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2d5f5d] to-[#161b22] border border-gray-700 flex items-center justify-center text-sm font-bold text-white hover:border-[#4fd1c5] transition-all cursor-pointer"
      >
        {userInitials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#161b22] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#2d5f5d] to-[#1a3f3d] px-4 py-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2d5f5d] to-[#161b22] border border-gray-600 flex items-center justify-center text-sm font-bold">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{userName}</p>
                <p className="text-gray-400 text-xs">{formatRole(userRole)}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* View Profile */}
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-3 flex items-center space-x-3 text-gray-300 hover:bg-[#1a3f3d] hover:text-[#4fd1c5] transition-all text-sm"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </button>

            {/* Change Password */}
            <button
              onClick={handleChangePasswordClick}
              className="w-full px-4 py-3 flex items-center space-x-3 text-gray-300 hover:bg-[#1a3f3d] hover:text-[#4fd1c5] transition-all text-sm"
            >
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </button>

            {/* Forgot Password */}
            <button
              onClick={handleForgotPasswordClick}
              className="w-full px-4 py-3 flex items-center space-x-3 text-gray-300 hover:bg-[#1a3f3d] hover:text-[#4fd1c5] transition-all text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>Forgot Password</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-gray-800" />

            {/* Logout */}
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-3 flex items-center space-x-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

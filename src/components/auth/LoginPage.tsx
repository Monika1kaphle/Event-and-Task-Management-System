import React from 'react'
import { LoginForm } from './LoginForm'
import { Calendar, CheckSquare } from 'lucide-react'

type LoginPageProps = {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <div className="min-h-screen w-full bg-[#0f1419] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2d5f5d]/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1a3a39]/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand Area */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#161b22] border border-gray-800 shadow-xl mb-4">
            <Calendar className="h-6 w-6 text-[#2d5f5d] mr-1" />
            <CheckSquare className="h-6 w-6 text-[#4a8b88]" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome to event and task management system
          </h1>

          <p className="text-gray-400 text-sm md:text-base">
            Manage your schedule efficiently and securely
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-6 md:p-8">
          <LoginForm onLoginSuccess={onLoginSuccess} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="#"
              className="text-[#2d5f5d] hover:text-[#3d7a77] font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
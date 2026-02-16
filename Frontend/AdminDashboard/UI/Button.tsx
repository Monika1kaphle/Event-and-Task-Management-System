import React from 'react'
import { Loader2 } from 'lucide-react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
  fullWidth?: boolean
}
export function Button({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
  const variants = {
    primary:
      'bg-[#2d5f5d] hover:bg-[#244f4d] text-white shadow-lg shadow-[#2d5f5d]/20 focus:ring-[#2d5f5d] border border-transparent',
    secondary:
      'bg-white/5 hover:bg-white/10 text-white border border-white/10 focus:ring-white/20',
    ghost:
      'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white focus:ring-gray-500',
  }
  const sizes = 'h-11 px-6 py-2'
  const width = fullWidth ? 'w-full' : ''
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes} ${width} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

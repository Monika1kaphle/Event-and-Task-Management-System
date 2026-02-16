import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name
  
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`
            w-full rounded-lg bg-[#161b22] border border-gray-800 
            px-4 py-3 text-white placeholder-gray-500
            transition-all duration-200
            focus:border-[#2d5f5d] focus:outline-none focus:ring-1 focus:ring-[#2d5f5d]
            disabled:opacity-50 disabled:bg-gray-900
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 animate-in slide-in-from-top-1 fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
import React from 'react'
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          className={`
            w-full rounded-lg bg-[#161b22] border border-gray-800 
            px-4 py-3 text-white placeholder-gray-500 min-h-[100px]
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
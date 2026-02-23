import React from 'react'
import { ChevronDown } from 'lucide-react'
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: {
    value: string
    label: string
  }[]
}
export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full appearance-none rounded-lg bg-[#161b22] border border-gray-800 
            px-4 py-3 text-white placeholder-gray-500
            transition-all duration-200
            focus:border-[#2d5f5d] focus:outline-none focus:ring-1 focus:ring-[#2d5f5d]
            disabled:opacity-50 disabled:bg-gray-900
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-400 animate-in slide-in-from-top-1 fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
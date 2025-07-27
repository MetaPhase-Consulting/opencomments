import React from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterGroupProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  hasActiveFilters?: boolean
  onClear?: () => void
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  hasActiveFilters = false,
  onClear
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-900">{title}</span>
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}

export default FilterGroup
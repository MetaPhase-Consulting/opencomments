import React from 'react'
import { X } from 'lucide-react'

interface FacetChipProps {
  label: string
  value: string
  onRemove: () => void
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

export const FacetChip: React.FC<FacetChipProps> = ({
  label,
  value,
  onRemove,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color]}`}>
      <span className="mr-1 text-xs opacity-75">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export default FacetChip
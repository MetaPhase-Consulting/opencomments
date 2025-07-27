import React from 'react'
import { AgencyRole, AGENCY_ROLES } from '../types/roles'
import { Shield, Crown, Settings, Eye, FileText } from 'lucide-react'

interface RoleBadgeProps {
  role: AgencyRole
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const getRoleIcon = (role: AgencyRole) => {
  switch (role) {
    case 'owner':
      return Crown
    case 'admin':
      return Settings
    case 'manager':
      return Shield
    case 'reviewer':
      return FileText
    case 'viewer':
      return Eye
    default:
      return Shield
  }
}

const getRoleColors = (role: AgencyRole) => {
  switch (role) {
    case 'owner':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200'
      }
    case 'admin':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800', 
        border: 'border-red-200'
      }
    case 'manager':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      }
    case 'reviewer':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      }
    case 'viewer':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
  }
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showDescription = false,
  size = 'md' 
}) => {
  const roleInfo = AGENCY_ROLES[role]
  const colors = getRoleColors(role)
  const IconComponent = getRoleIcon(role)
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  return (
    <div className="inline-flex flex-col items-start">
      <span 
        className={`
          inline-flex items-center rounded-full font-medium border
          ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}
        `}
        title={showDescription ? undefined : roleInfo.description}
      >
        <IconComponent className={`${iconSizes[size]} mr-1`} />
        {roleInfo.name}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-600 mt-1 max-w-xs">
          {roleInfo.description}
        </span>
      )}
    </div>
  )
}

export default RoleBadge
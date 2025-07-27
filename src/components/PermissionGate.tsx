import React from 'react'
import { Permission } from '../types/roles'
import { usePermissions } from '../hooks/usePermissions'

interface PermissionGateProps {
  permission: Permission
  agencyId?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showTooltip?: boolean
}

// Component that conditionally renders content based on user permissions
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  agencyId,
  children,
  fallback = null,
  showTooltip = false
}) => {
  const { hasPermission, getPermissionTooltip } = usePermissions(agencyId)
  
  const canAccess = hasPermission(permission)
  
  if (!canAccess) {
    if (showTooltip) {
      const tooltip = getPermissionTooltip(permission)
      return (
        <div title={tooltip} className="cursor-not-allowed opacity-50">
          {fallback}
        </div>
      )
    }
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission
  agencyId?: string
  children: React.ReactNode
}

// Button component that automatically handles permission checking
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  agencyId,
  children,
  className = '',
  ...props
}) => {
  const { hasPermission, getPermissionTooltip } = usePermissions(agencyId)
  
  const canAccess = hasPermission(permission)
  const tooltip = canAccess ? '' : getPermissionTooltip(permission)
  
  return (
    <button
      {...props}
      disabled={!canAccess || props.disabled}
      title={tooltip}
      className={`${className} ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

export default PermissionGate
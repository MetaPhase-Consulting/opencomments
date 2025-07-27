import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  AgencyRole, 
  Permission, 
  hasPermission, 
  canManageRole,
  getPermissionTooltip,
  AgencyMembership 
} from '../types/roles'

// Hook for checking permissions within a specific agency context
export const usePermissions = (agencyId?: string) => {
  const { profile } = useAuth()
  
  const currentMembership = useMemo(() => {
    if (!profile || !agencyId) return null
    
    // TODO: Replace with actual agency membership lookup from profile
    // For now, return mock data based on existing role
    const mockMembership: AgencyMembership = {
      agency_id: agencyId,
      agency_name: profile.agency_name || 'Unknown Agency',
      role: profile.role === 'agency' ? 'admin' : 'viewer', // Map existing role to agency role
      joined_at: profile.created_at,
    }
    
    return mockMembership
  }, [profile, agencyId])

  const userRole = currentMembership?.role

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!userRole) return false
      return hasPermission(userRole, permission)
    }
  }, [userRole])

  const checkCanManageRole = useMemo(() => {
    return (targetRole: AgencyRole): boolean => {
      if (!userRole) return false
      return canManageRole(userRole, targetRole)
    }
  }, [userRole])

  const getTooltip = useMemo(() => {
    return (permission: Permission): string => {
      if (!userRole) return 'Access denied'
      return getPermissionTooltip(permission, userRole)
    }
  }, [userRole])

  return {
    userRole,
    currentMembership,
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole,
    getPermissionTooltip: getTooltip,
    isLoggedIn: !!profile
  }
}

// Hook for getting all user's agency memberships
export const useAgencyMemberships = () => {
  const { profile } = useAuth()
  
  const memberships = useMemo(() => {
    if (!profile) return []
    
    // TODO: Replace with actual agency memberships from database
    // For now, create mock membership based on existing profile
    if (profile.role === 'agency' && profile.agency_name) {
      const mockMembership: AgencyMembership = {
        agency_id: profile.id, // Using profile ID as agency ID for now
        agency_name: profile.agency_name,
        role: 'admin', // Default to admin for existing agency users
        joined_at: profile.created_at,
      }
      return [mockMembership]
    }
    
    return []
  }, [profile])

  return {
    memberships,
    hasAnyAgencyAccess: memberships.length > 0,
    primaryAgency: memberships[0] || null
  }
}
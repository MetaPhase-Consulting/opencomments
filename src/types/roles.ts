// Role definitions and permission system for Agency Admin area

export type AgencyRole = 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'

export const AGENCY_ROLES: Record<AgencyRole, {
  name: string
  description: string
  level: number
}> = {
  owner: {
    name: 'Owner',
    description: 'Agency executive / principal contact',
    level: 5
  },
  admin: {
    name: 'Admin', 
    description: 'IT lead or program manager',
    level: 4
  },
  manager: {
    name: 'Manager',
    description: 'Program staff who run comment periods',
    level: 3
  },
  reviewer: {
    name: 'Reviewer',
    description: 'Clerk or analyst who reviews submissions',
    level: 2
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only staff, auditors',
    level: 1
  }
} as const

// Permission actions that can be performed
export type Permission = 
  | 'view_dashboard'
  | 'create_thread'
  | 'edit_thread'
  | 'close_thread'
  | 'archive_thread'
  | 'approve_comments'
  | 'reject_comments'
  | 'flag_comments'
  | 'bulk_export'
  | 'invite_users'
  | 'remove_users'
  | 'change_user_roles'
  | 'edit_agency_settings'
  | 'transfer_ownership'
  | 'archive_agency'
  | 'delete_agency'
  | 'view_analytics'
  | 'manage_moderation_queue'

// Permission matrix - defines what each role can do
export const PERMISSION_MATRIX: Record<AgencyRole, Permission[]> = {
  owner: [
    'view_dashboard',
    'create_thread',
    'edit_thread', 
    'close_thread',
    'archive_thread',
    'approve_comments',
    'reject_comments',
    'flag_comments',
    'bulk_export',
    'invite_users',
    'remove_users',
    'change_user_roles',
    'edit_agency_settings',
    'transfer_ownership',
    'archive_agency',
    'delete_agency',
    'view_analytics',
    'manage_moderation_queue'
  ],
  admin: [
    'view_dashboard',
    'create_thread',
    'edit_thread',
    'close_thread', 
    'archive_thread',
    'approve_comments',
    'reject_comments',
    'flag_comments',
    'bulk_export',
    'invite_users',
    'remove_users',
    'change_user_roles', // Limited to Manager level and below
    'edit_agency_settings',
    'view_analytics',
    'manage_moderation_queue'
  ],
  manager: [
    'view_dashboard',
    'create_thread',
    'edit_thread', // Only threads they own
    'close_thread', // Only threads they own
    'archive_thread', // Only threads they own
    'approve_comments',
    'reject_comments',
    'flag_comments',
    'bulk_export',
    'view_analytics',
    'manage_moderation_queue'
  ],
  reviewer: [
    'view_dashboard',
    'approve_comments',
    'reject_comments',
    'flag_comments',
    'bulk_export'
  ],
  viewer: [
    'view_dashboard',
    'bulk_export'
  ]
}

// Helper functions for permission checking
export const hasPermission = (role: AgencyRole, permission: Permission): boolean => {
  return PERMISSION_MATRIX[role].includes(permission)
}

export const canManageRole = (userRole: AgencyRole, targetRole: AgencyRole): boolean => {
  const userLevel = AGENCY_ROLES[userRole].level
  const targetLevel = AGENCY_ROLES[targetRole].level
  
  // Owners can manage anyone
  if (userRole === 'owner') return true
  
  // Admins can manage up to Manager level
  if (userRole === 'admin' && targetLevel <= AGENCY_ROLES.manager.level) return true
  
  return false
}

export const getRoleHierarchy = (): AgencyRole[] => {
  return Object.keys(AGENCY_ROLES)
    .sort((a, b) => AGENCY_ROLES[b as AgencyRole].level - AGENCY_ROLES[a as AgencyRole].level) as AgencyRole[]
}

export const isHigherRole = (role1: AgencyRole, role2: AgencyRole): boolean => {
  return AGENCY_ROLES[role1].level > AGENCY_ROLES[role2].level
}

// UI helper functions
export const getPermissionTooltip = (permission: Permission, userRole: AgencyRole): string => {
  if (hasPermission(userRole, permission)) return ''
  
  const requiredRoles = Object.entries(PERMISSION_MATRIX)
    .filter(([_, permissions]) => permissions.includes(permission))
    .map(([role, _]) => AGENCY_ROLES[role as AgencyRole].name)
    .sort((a, b) => {
      const roleA = Object.keys(AGENCY_ROLES).find(r => AGENCY_ROLES[r as AgencyRole].name === a) as AgencyRole
      const roleB = Object.keys(AGENCY_ROLES).find(r => AGENCY_ROLES[r as AgencyRole].name === b) as AgencyRole
      return AGENCY_ROLES[roleA].level - AGENCY_ROLES[roleB].level
    })
  
  const lowestRole = requiredRoles[0]
  return `Requires ${lowestRole} role or higher`
}

// Agency membership interface
export interface AgencyMembership {
  agency_id: string
  agency_name: string
  role: AgencyRole
  joined_at: string
  invited_by?: string
}

// Extended user profile with agency memberships
export interface AgencyUserProfile {
  id: string
  email: string
  full_name?: string
  memberships: AgencyMembership[]
  created_at: string
  updated_at: string
}
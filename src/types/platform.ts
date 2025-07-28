// Platform-level role definitions and types

export type PlatformRole = 'super_owner' | 'super_user'

export interface PlatformRoleInfo {
  user_id: string
  role: PlatformRole
  created_at: string
  created_by?: string
  updated_at: string
  updated_by?: string
}

export interface PlatformUser {
  id: string
  email: string
  full_name?: string
  platform_role?: PlatformRole
  created_at: string
}

export interface CreateAgencyRequest {
  name: string
  jurisdiction?: string
  jurisdiction_type?: 'state' | 'county' | 'city' | 'district' | 'other'
  description?: string
  owner_email: string
  owner_name?: string
}

export interface InviteUserRequest {
  agency_id: string
  email: string
  role: string
  full_name?: string
}

export const PLATFORM_ROLES: Record<PlatformRole, {
  name: string
  description: string
  level: number
}> = {
  super_owner: {
    name: 'Super Owner',
    description: 'Full platform access and agency management',
    level: 10
  },
  super_user: {
    name: 'Super User', 
    description: 'Agency creation and user invitation',
    level: 9
  }
} as const

// Platform permissions
export type PlatformPermission = 
  | 'create_agency'
  | 'invite_agency_owner'
  | 'invite_agency_user'
  | 'manage_super_users'
  | 'view_all_agencies'
  | 'impersonate_users'
  | 'access_platform_admin'

// Platform permission matrix
export const PLATFORM_PERMISSION_MATRIX: Record<PlatformRole, PlatformPermission[]> = {
  super_owner: [
    'create_agency',
    'invite_agency_owner',
    'invite_agency_user',
    'manage_super_users',
    'view_all_agencies',
    'impersonate_users',
    'access_platform_admin'
  ],
  super_user: [
    'create_agency',
    'invite_agency_owner',
    'invite_agency_user',
    'access_platform_admin'
  ]
}

// Helper functions for platform permission checking
export const hasPlatformPermission = (role: PlatformRole | null, permission: PlatformPermission): boolean => {
  if (!role) return false
  return PLATFORM_PERMISSION_MATRIX[role].includes(permission)
}

export const isPlatformAdmin = (role: PlatformRole | null): boolean => {
  return role === 'super_owner' || role === 'super_user'
}

export const isSuperOwner = (role: PlatformRole | null): boolean => {
  return role === 'super_owner'
}

export const getApprovedDomains = (): string[] => {
  return ['metaphaseconsulting.com', 'metaphase.tech', 'opencomments.us']
}

export const isApprovedDomain = (email: string): boolean => {
  const domains = getApprovedDomains()
  return domains.some(domain => email.toLowerCase().endsWith(`@${domain}`))
}
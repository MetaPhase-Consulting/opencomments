import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'public' | 'agency'

// TODO: Database schema updates needed for agency role system
// The following interfaces represent the target schema for agency roles
// Current implementation uses existing 'agency' role as fallback

export interface AgencyMember {
  id: string
  agency_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'
  invited_by?: string
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  description?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

// TODO: Add these tables to database schema:
// - agencies (id, name, description, settings, created_at, updated_at)
// - agency_members (id, agency_id, user_id, role, invited_by, joined_at, created_at, updated_at)
// - agency_invitations (id, agency_id, email, role, invited_by, token, expires_at, accepted_at, created_at)

// TODO: Update RLS policies to enforce agency role permissions
// - Users can only see agencies they're members of
// - Role-based access to agency resources (dockets, comments, etc.)
// - Audit logging for role changes and sensitive actions

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  agency_name?: string
  created_at: string
  updated_at: string
}
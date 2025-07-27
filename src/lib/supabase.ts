import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'public' | 'agency'

// Agency role system interfaces
export type AgencyRole = 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'

export interface AgencyMember {
  id: string
  agency_id: string
  user_id: string
  role: AgencyRole
  invited_by?: string
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  jurisdiction?: string
  description?: string
  logo_url?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AgencyInvitation {
  id: string
  agency_id: string
  email: string
  role: AgencyRole
  invited_by: string
  token: string
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface DocketTag {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface DocketAttachment {
  id: string
  docket_id: string
  filename: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
}

export interface CommentAttachment {
  id: string
  comment_id: string
  filename: string
  file_url: string
  file_size: number
  mime_type: string
  created_at: string
}

export interface ModerationLog {
  id: string
  comment_id: string
  action: 'approve' | 'reject' | 'flag' | 'unflag' | 'edit' | 'delete'
  actor_id: string
  previous_status?: 'pending' | 'approved' | 'rejected' | 'flagged'
  new_status?: 'pending' | 'approved' | 'rejected' | 'flagged'
  reason?: string
  notes?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  agency_name?: string
  created_at: string
  updated_at: string
}
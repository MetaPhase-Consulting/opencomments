import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'public' | 'agency'

// Agency role system - matches database enums exactly
export type AgencyRole = 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'unflag' | 'edit' | 'delete'

// Database enums
export type DocketStatus = 'draft' | 'open' | 'closed' | 'archived'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

// Audit interfaces
export interface AuditRecord {
  id: string
  record_id: string
  action: AuditAction
  actor_id?: string
  old_data?: any
  new_data?: any
  changed_fields?: any
  action_timestamp: string
  created_at: string
}

export interface DocketAudit extends AuditRecord {}
export interface CommentAudit extends AuditRecord {}
export interface AgencyMemberAudit extends AuditRecord {}
export interface ProfileAudit extends AuditRecord {}

// Core agency interfaces matching database schema
export interface Agency {
  id: string
  name: string
  jurisdiction?: string
  description?: string
  logo_url?: string
  settings?: any
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
}

export interface AgencyMember {
  id: string
  agency_id: string
  user_id: string
  role: AgencyRole
  invited_by?: string
  joined_at: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
}

export interface Docket {
  id: string
  agency_id: string
  title: string
  description: string
  summary?: string
  slug?: string
  reference_code?: string
  tags?: string[]
  status: DocketStatus
  comment_deadline: string
  open_at?: string
  close_at?: string
  settings?: any
  auto_publish?: boolean
  require_captcha?: boolean
  max_file_size_mb?: number
  allowed_file_types?: string[]
  created_by?: string
  created_at: string
  updated_at: string
  updated_by?: string
  deleted_at?: string
}

export interface Comment {
  id: string
  docket_id: string
  user_id: string
  commenter_name?: string
  commenter_email?: string
  commenter_organization?: string
  content: string
  status: CommentStatus
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  deleted_at?: string
}

export interface CommentAttachment {
  id: string
  comment_id: string
  filename: string
  file_url: string
  file_path: string
  mime_type: string
  file_size: number
  created_at: string
  created_by?: string
  updated_at: string
  updated_by?: string
  deleted_at?: string
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

export interface ModerationLog {
  id: string
  comment_id: string
  action: ModerationAction
  actor_id: string
  previous_status?: CommentStatus
  new_status?: CommentStatus
  reason?: string
  notes?: string
  created_at: string
}

export interface SavedDocket {
  id: string
  user_id: string
  docket_id: string
  saved_at: string
}

export interface AllowedFileType {
  id: string
  extension: string
  mime_type: string
  description: string
  max_size_mb?: number
  is_active: boolean
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
  created_by?: string
  updated_by?: string
  deleted_at?: string
}
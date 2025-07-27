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
export type DocketStatus = 'draft' | 'open' | 'closed' | 'archived'
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'unflag' | 'edit' | 'delete'

// Core agency interfaces matching database schema
export interface Agency {
  id: string
  slug: string
  name: string
  jurisdiction?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface AgencyUser {
  id: string
  agency_id: string
  user_id: string
  role: AgencyRole
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface DocketTag {
  id: string
  docket_id: string
  tag_id: string
  created_at: string
}

export interface Docket {
  id: string
  agency_id: string
  title: string
  description: string
  summary?: string
  slug?: string
  status: DocketStatus
  open_at?: string
  close_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  docket_id: string
  user_id: string
  submitter_name?: string
  submitter_email?: string
  content: string
  body?: string
  status: CommentStatus
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  comment_id: string
  file_url: string
  mime_type: string
  file_size: bigint
  text_extracted?: string
  created_at: string
}

export interface ModerationLog {
  id: string
  comment_id: string
  action: ModerationAction
  actor_id: string
  timestamp: string
  reason?: string
  notes?: string
  created_at: string
}

export interface AgencySettings {
  agency_id: string
  max_file_size_mb: number
  allowed_mime_types: string[]
  captcha_enabled: boolean
  auto_publish: boolean
  created_at: string
  updated_at: string
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
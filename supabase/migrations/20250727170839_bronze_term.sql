/*
  # Align Agency Schema with Data Model Checklist

  This migration ensures our schema matches the specified data model checklist:
  
  1. Tables & Relationships
     - `agencies` - One row per organization
     - `agency_users` - Maps auth.users to agencies with roles (renamed from agency_members)
     - `dockets` - Public comment windows
     - `tags` - Reusable topic labels
     - `docket_tags` - Many-to-many join table for dockets ↔ tags
     - `comments` - Public submissions
     - `attachments` - Files uploaded with comments
     - `moderation_logs` - Audit trail for moderation actions
     - `agency_settings` - Per-agency configuration overrides

  2. Enums
     - `agency_role` - Five-tier role hierarchy
     - `docket_status` - Comment window states
     - `comment_status` - Submission states
     - `moderation_action` - Moderation action types

  3. Security
     - RLS enabled on all tables
     - Agency-scoped access control
     - Role-based permissions
*/

-- Create agency_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE agency_role AS ENUM ('owner', 'admin', 'manager', 'reviewer', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create docket_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE docket_status AS ENUM ('draft', 'open', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create comment_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create moderation_action enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE moderation_action AS ENUM ('approve', 'reject', 'flag', 'unflag', 'edit', 'delete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  jurisdiction text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agency_users table (many-to-many mapping)
CREATE TABLE IF NOT EXISTS agency_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role agency_role NOT NULL DEFAULT 'reviewer',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Update dockets table to match checklist
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'slug') THEN
    ALTER TABLE dockets ADD COLUMN slug text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'summary') THEN
    ALTER TABLE dockets ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'open_at') THEN
    ALTER TABLE dockets ADD COLUMN open_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'close_at') THEN
    ALTER TABLE dockets ADD COLUMN close_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'created_by') THEN
    ALTER TABLE dockets ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
  
  -- Update status column to use enum if it's still text
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status;
  END IF;
END $$;

-- Create docket_tags join table (many-to-many)
CREATE TABLE IF NOT EXISTS docket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid NOT NULL REFERENCES dockets(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(docket_id, tag_id)
);

-- Update comments table to match checklist
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'submitter_name') THEN
    ALTER TABLE comments ADD COLUMN submitter_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'submitter_email') THEN
    ALTER TABLE comments ADD COLUMN submitter_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'body') THEN
    ALTER TABLE comments ADD COLUMN body text;
  END IF;
  
  -- Update status column to use enum if it's still text
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE comments ALTER COLUMN status TYPE comment_status USING status::comment_status;
  END IF;
END $$;

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  text_extracted text, -- Future feature for searchable content
  created_at timestamptz DEFAULT now()
);

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  action moderation_action NOT NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  timestamp timestamptz DEFAULT now(),
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create agency_settings table (1-to-1 with agencies)
CREATE TABLE IF NOT EXISTS agency_settings (
  agency_id uuid PRIMARY KEY REFERENCES agencies(id) ON DELETE CASCADE,
  max_file_size_mb integer DEFAULT 10,
  allowed_mime_types text[] DEFAULT ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  captcha_enabled boolean DEFAULT true,
  auto_publish boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_users_agency_id ON agency_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_user_id ON agency_users(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_role ON agency_users(role);
CREATE INDEX IF NOT EXISTS idx_dockets_agency_id ON dockets(agency_id);
CREATE INDEX IF NOT EXISTS idx_dockets_status ON dockets(status);
CREATE INDEX IF NOT EXISTS idx_dockets_slug ON dockets(slug);
CREATE INDEX IF NOT EXISTS idx_docket_tags_docket_id ON docket_tags(docket_id);
CREATE INDEX IF NOT EXISTS idx_docket_tags_tag_id ON docket_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_comments_docket_id ON comments(docket_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_attachments_comment_id ON attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_comment_id ON moderation_logs(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_actor_id ON moderation_logs(actor_id);

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE docket_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencies
CREATE POLICY "Users can read agencies they belong to" ON agencies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agencies.id 
      AND agency_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can update agency" ON agencies
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agencies.id 
      AND agency_users.user_id = auth.uid() 
      AND agency_users.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for agency_users
CREATE POLICY "Users can read agency members for their agencies" ON agency_users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users au2 
      WHERE au2.agency_id = agency_users.agency_id 
      AND au2.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can manage members" ON agency_users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users au2 
      WHERE au2.agency_id = agency_users.agency_id 
      AND au2.user_id = auth.uid() 
      AND au2.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tags (readable by all authenticated users)
CREATE POLICY "Anyone can read tags" ON tags
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for docket_tags
CREATE POLICY "Users can read docket tags for accessible dockets" ON docket_tags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets d
      JOIN agency_users au ON au.agency_id = d.agency_id
      WHERE d.id = docket_tags.docket_id 
      AND au.user_id = auth.uid()
    )
  );

-- RLS Policies for attachments
CREATE POLICY "Users can read attachments for accessible comments" ON attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      JOIN agency_users au ON au.agency_id = d.agency_id
      WHERE c.id = attachments.comment_id 
      AND au.user_id = auth.uid()
    )
  );

-- RLS Policies for moderation_logs
CREATE POLICY "Agency members can read moderation logs for their dockets" ON moderation_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      JOIN agency_users au ON au.agency_id = d.agency_id
      WHERE c.id = moderation_logs.comment_id 
      AND au.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency reviewers+ can create moderation logs" ON moderation_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      JOIN agency_users au ON au.agency_id = d.agency_id
      WHERE c.id = moderation_logs.comment_id 
      AND au.user_id = auth.uid() 
      AND au.role IN ('owner', 'admin', 'manager', 'reviewer')
    )
    AND auth.uid() = actor_id
  );

-- RLS Policies for agency_settings
CREATE POLICY "Agency members can read settings" ON agency_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agency_settings.agency_id 
      AND agency_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency admins+ can update settings" ON agency_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agency_settings.agency_id 
      AND agency_users.user_id = auth.uid() 
      AND agency_users.role IN ('owner', 'admin')
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agency_users_updated_at BEFORE UPDATE ON agency_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agency_settings_updated_at BEFORE UPDATE ON agency_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get user's role in an agency
CREATE OR REPLACE FUNCTION get_user_agency_role(user_uuid uuid, agency_uuid uuid)
RETURNS agency_role AS $$
BEGIN
  RETURN (
    SELECT role FROM agency_users 
    WHERE user_id = user_uuid AND agency_id = agency_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission in agency
CREATE OR REPLACE FUNCTION user_has_agency_permission(user_uuid uuid, agency_uuid uuid, required_role agency_role)
RETURNS boolean AS $$
DECLARE
  user_role agency_role;
  role_hierarchy integer;
  required_hierarchy integer;
BEGIN
  -- Get user's role in the agency
  SELECT role INTO user_role FROM agency_users 
  WHERE user_id = user_uuid AND agency_id = agency_uuid;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Convert roles to hierarchy levels (higher number = more permissions)
  role_hierarchy := CASE user_role
    WHEN 'viewer' THEN 1
    WHEN 'reviewer' THEN 2
    WHEN 'manager' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'owner' THEN 5
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'viewer' THEN 1
    WHEN 'reviewer' THEN 2
    WHEN 'manager' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'owner' THEN 5
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
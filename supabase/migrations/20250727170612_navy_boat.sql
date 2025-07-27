/*
  # Agency Admin Schema Migration

  1. New Tables
    - `agencies` - Agency organizations with settings
    - `agency_members` - User memberships in agencies with roles
    - `agency_invitations` - Pending invitations to join agencies
    - `dockets` - Public comment periods/windows
    - `docket_attachments` - Supporting documents for dockets
    - `comment_attachments` - Files attached to public comments
    - `moderation_logs` - Audit trail for moderation actions
    - `docket_tags` - Predefined topic tags for categorization

  2. Enums
    - `agency_role` - Five-tier role hierarchy
    - `docket_status` - Lifecycle states for comment windows
    - `comment_status` - Moderation states for submissions
    - `moderation_action` - Types of moderation actions

  3. Security
    - Enable RLS on all new tables
    - Role-based access policies
    - Audit logging for sensitive operations

  4. Updates to Existing Tables
    - Update existing `dockets` table structure
    - Enhance `comments` table with new fields
    - Add agency relationship to existing profiles
*/

-- Create enums for type safety
CREATE TYPE agency_role AS ENUM ('owner', 'admin', 'manager', 'reviewer', 'viewer');
CREATE TYPE docket_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE moderation_action AS ENUM ('approve', 'reject', 'flag', 'unflag', 'edit', 'delete');

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  jurisdiction text,
  description text,
  logo_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency memberships (replaces single agency_name in profiles)
CREATE TABLE IF NOT EXISTS agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role agency_role NOT NULL DEFAULT 'reviewer',
  invited_by uuid REFERENCES profiles(id),
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

-- Agency invitations for invite-only access
CREATE TABLE IF NOT EXISTS agency_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role agency_role NOT NULL DEFAULT 'reviewer',
  invited_by uuid NOT NULL REFERENCES profiles(id),
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Predefined tags for docket categorization
CREATE TABLE IF NOT EXISTS docket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Update existing dockets table structure
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'summary') THEN
    ALTER TABLE dockets ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'slug') THEN
    ALTER TABLE dockets ADD COLUMN slug text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'reference_code') THEN
    ALTER TABLE dockets ADD COLUMN reference_code text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'tags') THEN
    ALTER TABLE dockets ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'open_at') THEN
    ALTER TABLE dockets ADD COLUMN open_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'close_at') THEN
    ALTER TABLE dockets ADD COLUMN close_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'settings') THEN
    ALTER TABLE dockets ADD COLUMN settings jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'auto_publish') THEN
    ALTER TABLE dockets ADD COLUMN auto_publish boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'require_captcha') THEN
    ALTER TABLE dockets ADD COLUMN require_captcha boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'max_file_size_mb') THEN
    ALTER TABLE dockets ADD COLUMN max_file_size_mb integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'allowed_file_types') THEN
    ALTER TABLE dockets ADD COLUMN allowed_file_types text[] DEFAULT ARRAY['pdf', 'docx', 'jpg', 'png'];
  END IF;
END $$;

-- Supporting documents for dockets
CREATE TABLE IF NOT EXISTS docket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid NOT NULL REFERENCES dockets(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Update existing comments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'commenter_name') THEN
    ALTER TABLE comments ADD COLUMN commenter_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'commenter_email') THEN
    ALTER TABLE comments ADD COLUMN commenter_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'commenter_organization') THEN
    ALTER TABLE comments ADD COLUMN commenter_organization text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'ip_address') THEN
    ALTER TABLE comments ADD COLUMN ip_address inet;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_agent') THEN
    ALTER TABLE comments ADD COLUMN user_agent text;
  END IF;
END $$;

-- File attachments for public comments
CREATE TABLE IF NOT EXISTS comment_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Moderation audit log
CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  action moderation_action NOT NULL,
  actor_id uuid NOT NULL REFERENCES profiles(id),
  previous_status comment_status,
  new_status comment_status,
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE docket_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE docket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencies
CREATE POLICY "Users can read agencies they belong to"
  ON agencies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = agencies.id 
      AND agency_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can update agency"
  ON agencies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = agencies.id 
      AND agency_members.user_id = auth.uid()
      AND agency_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for agency members
CREATE POLICY "Users can read agency members for their agencies"
  ON agency_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am2
      WHERE am2.agency_id = agency_members.agency_id 
      AND am2.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can manage members"
  ON agency_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am2
      WHERE am2.agency_id = agency_members.agency_id 
      AND am2.user_id = auth.uid()
      AND am2.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for dockets (update existing)
DROP POLICY IF EXISTS "Agencies can manage own dockets" ON dockets;
DROP POLICY IF EXISTS "Public can read open dockets" ON dockets;

CREATE POLICY "Agency members can read dockets"
  ON dockets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = dockets.agency_id 
      AND agency_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read open dockets"
  ON dockets
  FOR SELECT
  TO anon, authenticated
  USING (status = 'open');

CREATE POLICY "Agency managers+ can create dockets"
  ON dockets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = dockets.agency_id 
      AND agency_members.user_id = auth.uid()
      AND agency_members.role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Agency managers+ can update dockets"
  ON dockets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = dockets.agency_id 
      AND agency_members.user_id = auth.uid()
      AND agency_members.role IN ('owner', 'admin', 'manager')
    )
  );

-- RLS Policies for comments (update existing)
DROP POLICY IF EXISTS "Users can read own comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments on open dockets" ON comments;
DROP POLICY IF EXISTS "Agencies can read comments on own dockets" ON comments;
DROP POLICY IF EXISTS "Agencies can update comment status on own dockets" ON comments;

CREATE POLICY "Users can read own comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Agency members can read comments on agency dockets"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets d
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE d.id = comments.docket_id 
      AND am.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read approved comments"
  ON comments
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = comments.docket_id 
      AND dockets.status = 'open'
    )
  );

CREATE POLICY "Users can create comments on open dockets"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = comments.docket_id 
      AND dockets.status = 'open'
      AND (dockets.close_at IS NULL OR dockets.close_at > now())
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Agency reviewers+ can update comment status"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets d
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE d.id = comments.docket_id 
      AND am.user_id = auth.uid()
      AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
    )
  );

-- RLS Policies for attachments
CREATE POLICY "Users can read attachments for accessible comments"
  ON comment_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments 
      WHERE comments.id = comment_attachments.comment_id
      AND (
        comments.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM dockets d
          JOIN agency_members am ON am.agency_id = d.agency_id
          WHERE d.id = comments.docket_id 
          AND am.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Agency members can read docket attachments"
  ON docket_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets d
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE d.id = docket_attachments.docket_id 
      AND am.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read attachments for open dockets"
  ON docket_attachments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = docket_attachments.docket_id 
      AND dockets.status = 'open'
    )
  );

-- RLS Policies for moderation logs
CREATE POLICY "Agency members can read moderation logs for their dockets"
  ON moderation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE c.id = moderation_logs.comment_id 
      AND am.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency reviewers+ can create moderation logs"
  ON moderation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE c.id = moderation_logs.comment_id 
      AND am.user_id = auth.uid()
      AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
    )
    AND auth.uid() = actor_id
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON agency_members(role);
CREATE INDEX IF NOT EXISTS idx_dockets_agency_id ON dockets(agency_id);
CREATE INDEX IF NOT EXISTS idx_dockets_status ON dockets(status);
CREATE INDEX IF NOT EXISTS idx_dockets_slug ON dockets(slug);
CREATE INDEX IF NOT EXISTS idx_comments_docket_id ON comments(docket_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment_id ON comment_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_docket_attachments_docket_id ON docket_attachments(docket_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_comment_id ON moderation_logs(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_actor_id ON moderation_logs(actor_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agency_members_updated_at BEFORE UPDATE ON agency_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get user's role in an agency
CREATE OR REPLACE FUNCTION get_user_agency_role(agency_uuid uuid)
RETURNS agency_role AS $$
BEGIN
  RETURN (
    SELECT role FROM agency_members 
    WHERE agency_id = agency_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission in agency
CREATE OR REPLACE FUNCTION user_has_agency_permission(agency_uuid uuid, required_role agency_role)
RETURNS boolean AS $$
DECLARE
  user_role agency_role;
  role_hierarchy integer;
  required_hierarchy integer;
BEGIN
  -- Get user's role in the agency
  SELECT role INTO user_role FROM agency_members 
  WHERE agency_id = agency_uuid AND user_id = auth.uid();
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Define role hierarchy (higher number = more permissions)
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
/*
  # Align Agency Schema with Data Model Checklist

  1. Core Tables
    - agencies: Organization records with slug, name, jurisdiction
    - agency_users: Many-to-many user-agency mapping with roles
    - tags: Reusable topic labels
    - docket_tags: Many-to-many dockets ↔ tags
    - dockets: Comment windows with proper scheduling
    - comments: Public submissions with submitter details
    - attachments: File uploads linked to comments
    - moderation_logs: Complete audit trail
    - agency_settings: Per-agency configuration

  2. Enums
    - agency_role: owner, admin, manager, reviewer, viewer
    - docket_status: draft, open, closed, archived
    - comment_status: pending, approved, rejected, flagged
    - moderation_action: approve, reject, flag, unflag, edit, delete

  3. Security
    - RLS enabled on all tables
    - Agency-scoped access policies
    - Role hierarchy enforcement
*/

-- Create enums first
DO $$ BEGIN
  CREATE TYPE agency_role AS ENUM ('owner', 'admin', 'manager', 'reviewer', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE docket_status AS ENUM ('draft', 'open', 'closed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- Update dockets table with new fields
DO $$
BEGIN
  -- Add missing columns to dockets if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'summary') THEN
    ALTER TABLE dockets ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'slug') THEN
    ALTER TABLE dockets ADD COLUMN slug text UNIQUE;
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
  
  -- Update status column to use enum if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'status') THEN
    -- Convert existing status column to use enum
    ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status;
  ELSE
    ALTER TABLE dockets ADD COLUMN status docket_status DEFAULT 'draft';
  END IF;
END $$;

-- Create docket_tags join table
CREATE TABLE IF NOT EXISTS docket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid NOT NULL REFERENCES dockets(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(docket_id, tag_id)
);

-- Update comments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'submitter_name') THEN
    ALTER TABLE comments ADD COLUMN submitter_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'submitter_email') THEN
    ALTER TABLE comments ADD COLUMN submitter_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'body') THEN
    ALTER TABLE comments ADD COLUMN body text;
  END IF;
  
  -- Update status column to use enum
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'status') THEN
    ALTER TABLE comments ALTER COLUMN status TYPE comment_status USING status::comment_status;
  ELSE
    ALTER TABLE comments ADD COLUMN status comment_status DEFAULT 'pending';
  END IF;
END $$;

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  text_extracted text,
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

-- Create agency_settings table
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
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE docket_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agencies
CREATE POLICY "Users can read agencies they belong to"
  ON agencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agencies.id 
      AND agency_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can update agency"
  ON agencies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agencies.id 
      AND agency_users.user_id = auth.uid() 
      AND agency_users.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for agency_users
CREATE POLICY "Users can read agency members for their agencies"
  ON agency_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users au2 
      WHERE au2.agency_id = agency_users.agency_id 
      AND au2.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can manage members"
  ON agency_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users au2 
      WHERE au2.agency_id = agency_users.agency_id 
      AND au2.user_id = auth.uid() 
      AND au2.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for tags (public read)
CREATE POLICY "Anyone can read tags"
  ON tags FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create RLS policies for docket_tags
CREATE POLICY "Users can read docket tags for accessible dockets"
  ON docket_tags FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = docket_tags.docket_id 
      AND (
        dockets.status = 'open' 
        OR EXISTS (
          SELECT 1 FROM agency_users 
          WHERE agency_users.agency_id = dockets.agency_id 
          AND agency_users.user_id = auth.uid()
        )
      )
    )
  );

-- Create RLS policies for attachments
CREATE POLICY "Users can read attachments for accessible comments"
  ON attachments FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM comments 
      JOIN dockets ON dockets.id = comments.docket_id
      WHERE comments.id = attachments.comment_id 
      AND (
        (dockets.status = 'open' AND comments.status = 'approved')
        OR EXISTS (
          SELECT 1 FROM agency_users 
          WHERE agency_users.agency_id = dockets.agency_id 
          AND agency_users.user_id = auth.uid()
        )
      )
    )
  );

-- Create RLS policies for moderation_logs
CREATE POLICY "Agency members can read moderation logs for their dockets"
  ON moderation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comments 
      JOIN dockets ON dockets.id = comments.docket_id
      JOIN agency_users ON agency_users.agency_id = dockets.agency_id
      WHERE comments.id = moderation_logs.comment_id 
      AND agency_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency reviewers+ can create moderation logs"
  ON moderation_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comments 
      JOIN dockets ON dockets.id = comments.docket_id
      JOIN agency_users ON agency_users.agency_id = dockets.agency_id
      WHERE comments.id = moderation_logs.comment_id 
      AND agency_users.user_id = auth.uid()
      AND agency_users.role IN ('owner', 'admin', 'manager', 'reviewer')
    )
    AND auth.uid() = actor_id
  );

-- Create RLS policies for agency_settings
CREATE POLICY "Agency members can read their agency settings"
  ON agency_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agency_settings.agency_id 
      AND agency_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Agency owners and admins can update settings"
  ON agency_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_users.agency_id = agency_settings.agency_id 
      AND agency_users.user_id = auth.uid() 
      AND agency_users.role IN ('owner', 'admin')
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_agency_role(user_id uuid, agency_id uuid)
RETURNS agency_role AS $$
BEGIN
  RETURN (
    SELECT role FROM agency_users 
    WHERE agency_users.user_id = $1 
    AND agency_users.agency_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_agency_permission(user_id uuid, agency_id uuid, required_role agency_role)
RETURNS boolean AS $$
DECLARE
  user_role agency_role;
  role_hierarchy integer;
  required_hierarchy integer;
BEGIN
  -- Get user's role in the agency
  SELECT role INTO user_role FROM agency_users 
  WHERE agency_users.user_id = $1 AND agency_users.agency_id = $2;
  
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
    ELSE 0
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'viewer' THEN 1
    WHEN 'reviewer' THEN 2
    WHEN 'manager' THEN 3
    WHEN 'admin' THEN 4
    WHEN 'owner' THEN 5
    ELSE 0
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_users_updated_at
  BEFORE UPDATE ON agency_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to ensure at least one owner per agency
CREATE OR REPLACE FUNCTION ensure_agency_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If we're deleting or changing an owner role
  IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
    
    -- Check if this would leave the agency without any owners
    IF NOT EXISTS (
      SELECT 1 FROM agency_users 
      WHERE agency_id = COALESCE(OLD.agency_id, NEW.agency_id) 
      AND role = 'owner' 
      AND id != COALESCE(OLD.id, NEW.id)
    ) THEN
      RAISE EXCEPTION 'Cannot remove the last owner from an agency';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_agency_has_owner_trigger
  BEFORE UPDATE OR DELETE ON agency_users
  FOR EACH ROW EXECUTE FUNCTION ensure_agency_has_owner();

-- Create trigger to auto-create agency settings
CREATE OR REPLACE FUNCTION create_agency_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agency_settings (agency_id)
  VALUES (NEW.id)
  ON CONFLICT (agency_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agency_settings_trigger
  AFTER INSERT ON agencies
  FOR EACH ROW EXECUTE FUNCTION create_agency_settings();
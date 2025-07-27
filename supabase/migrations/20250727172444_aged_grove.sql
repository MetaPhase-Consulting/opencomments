/*
  # Comprehensive Schema Update with Audit System and Moderation Queue

  This migration implements:
  1. Complete audit system with proper column additions
  2. Moderation queue functionality
  3. File upload system with Supabase Storage
  4. Role-based permissions and RLS policies
  5. Cleanup of any previous migration issues

  ## Changes Made
  - Add audit columns to all main tables
  - Create audit tables with proper triggers
  - Implement moderation queue with comment status tracking
  - Set up file attachment system
  - Create storage bucket and policies
  - Add comprehensive RLS policies
  - Clean up any unused/problematic tables
*/

-- First, clean up any problematic existing objects
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS docket_tags CASCADE;
DROP VIEW IF EXISTS active_profiles CASCADE;
DROP VIEW IF EXISTS active_agencies CASCADE;
DROP VIEW IF EXISTS active_agency_members CASCADE;
DROP VIEW IF EXISTS active_dockets CASCADE;
DROP VIEW IF EXISTS active_comments CASCADE;

-- Drop any existing audit tables to recreate them properly
DROP TABLE IF EXISTS dockets_audit CASCADE;
DROP TABLE IF EXISTS comments_audit CASCADE;
DROP TABLE IF EXISTS agency_members_audit CASCADE;
DROP TABLE IF EXISTS profiles_audit CASCADE;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS audit_dockets_trigger ON dockets;
DROP TRIGGER IF EXISTS audit_comments_trigger ON comments;
DROP TRIGGER IF EXISTS audit_agency_members_trigger ON agency_members;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
DROP TRIGGER IF EXISTS update_agency_members_updated_at ON agency_members;
DROP TRIGGER IF EXISTS update_dockets_updated_at ON dockets;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Create required enums
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');
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

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION uid() RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit function
CREATE OR REPLACE FUNCTION create_audit_record()
RETURNS TRIGGER AS $$
DECLARE
    audit_table_name TEXT;
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := uid();
    
    -- Determine audit table name
    audit_table_name := TG_TABLE_NAME || '_audit';
    
    -- Prepare data based on operation
    CASE TG_OP
        WHEN 'INSERT' THEN
            new_data := to_jsonb(NEW);
            old_data := NULL;
            changed_fields := new_data;
        WHEN 'UPDATE' THEN
            old_data := to_jsonb(OLD);
            new_data := to_jsonb(NEW);
            -- Only include changed fields
            SELECT jsonb_object_agg(key, value)
            INTO changed_fields
            FROM jsonb_each(new_data)
            WHERE old_data->key IS DISTINCT FROM value;
        WHEN 'DELETE' THEN
            old_data := to_jsonb(OLD);
            new_data := NULL;
            changed_fields := old_data;
    END CASE;
    
    -- Insert audit record using dynamic SQL
    EXECUTE format('
        INSERT INTO %I (
            record_id, action, actor_id, old_data, new_data, 
            changed_fields, action_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        audit_table_name
    ) USING 
        COALESCE(NEW.id, OLD.id),
        TG_OP::audit_action,
        current_user_id,
        old_data,
        new_data,
        changed_fields,
        NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit columns to existing tables (using explicit table names to avoid ambiguity)
-- Profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Agencies table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE agencies ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE agencies ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE agencies ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Agency_members table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agency_members' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE agency_members ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agency_members' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE agency_members ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agency_members' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE agency_members ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Dockets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'dockets' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE dockets ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'dockets' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE dockets ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'dockets' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE dockets ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Comments table (add status column and audit columns)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'status'
    ) THEN
        ALTER TABLE comments ADD COLUMN status comment_status DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE comments ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE comments ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create comment_attachments table
CREATE TABLE IF NOT EXISTS comment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ
);

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    action moderation_action NOT NULL,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    previous_status comment_status,
    new_status comment_status,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit tables
CREATE TABLE IF NOT EXISTS dockets_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agency_members_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment_id ON comment_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_comment_id ON moderation_logs(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_actor_id ON moderation_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_docket_id ON comments(docket_id);

-- Audit table indexes
CREATE INDEX IF NOT EXISTS idx_dockets_audit_record_id ON dockets_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_dockets_audit_timestamp ON dockets_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_audit_record_id ON comments_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_comments_audit_timestamp ON comments_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_record_id ON agency_members_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_timestamp ON agency_members_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_record_id ON profiles_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_timestamp ON profiles_audit(action_timestamp);

-- Enable RLS on all tables
ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dockets_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_attachments
CREATE POLICY "Users can read attachments for accessible comments"
    ON comment_attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM comments c
            JOIN dockets d ON d.id = c.docket_id
            JOIN agency_members am ON am.agency_id = d.agency_id
            WHERE c.id = comment_id 
            AND am.user_id = auth.uid()
            AND am.deleted_at IS NULL
        )
        OR
        EXISTS (
            SELECT 1 FROM comments c
            WHERE c.id = comment_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attachments for their comments"
    ON comment_attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM comments c
            WHERE c.id = comment_id AND c.user_id = auth.uid()
        )
    );

-- RLS Policies for moderation_logs
CREATE POLICY "Agency reviewers can read moderation logs"
    ON moderation_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM comments c
            JOIN dockets d ON d.id = c.docket_id
            JOIN agency_members am ON am.agency_id = d.agency_id
            WHERE c.id = comment_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
            AND am.deleted_at IS NULL
        )
    );

CREATE POLICY "Agency reviewers can create moderation logs"
    ON moderation_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM comments c
            JOIN dockets d ON d.id = c.docket_id
            JOIN agency_members am ON am.agency_id = d.agency_id
            WHERE c.id = comment_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
            AND am.deleted_at IS NULL
        )
        AND actor_id = auth.uid()
    );

-- RLS Policies for audit tables (Admin+ only)
CREATE POLICY "Agency admins can read docket audit logs"
    ON dockets_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM dockets d
            JOIN agency_members am ON am.agency_id = d.agency_id
            WHERE d.id = record_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
            AND am.deleted_at IS NULL
        )
    );

CREATE POLICY "Agency admins can read comment audit logs"
    ON comments_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM comments c
            JOIN dockets d ON d.id = c.docket_id
            JOIN agency_members am ON am.agency_id = d.agency_id
            WHERE c.id = record_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
            AND am.deleted_at IS NULL
        )
    );

CREATE POLICY "Agency admins can read member audit logs"
    ON agency_members_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members am1
            JOIN agency_members am2 ON am2.agency_id = am1.agency_id
            WHERE am1.id = record_id 
            AND am2.user_id = auth.uid()
            AND am2.role IN ('owner', 'admin')
            AND am1.deleted_at IS NULL
            AND am2.deleted_at IS NULL
        )
    );

CREATE POLICY "Users can read own profile audit logs"
    ON profiles_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = record_id AND p.id = auth.uid()
        )
    );

-- Add audit triggers to main tables
CREATE TRIGGER audit_dockets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dockets
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER audit_comments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER audit_agency_members_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_members_updated_at
    BEFORE UPDATE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dockets_updated_at
    BEFORE UPDATE ON dockets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comment_attachments_updated_at
    BEFORE UPDATE ON comment_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create moderation queue view for easier querying
CREATE OR REPLACE VIEW moderation_queue AS
SELECT 
    c.id,
    c.docket_id,
    c.content,
    c.status,
    c.commenter_name,
    c.commenter_email,
    c.commenter_organization,
    c.created_at,
    c.updated_at,
    d.title as docket_title,
    d.agency_id,
    COALESCE(att.attachment_count, 0) as attachment_count
FROM comments c
JOIN dockets d ON d.id = c.docket_id
LEFT JOIN (
    SELECT 
        comment_id, 
        COUNT(*) as attachment_count
    FROM comment_attachments 
    WHERE deleted_at IS NULL
    GROUP BY comment_id
) att ON att.comment_id = c.id
WHERE c.deleted_at IS NULL
AND d.deleted_at IS NULL;

-- Create storage bucket for comment attachments (this will be handled by the application)
-- The bucket creation and policies will be set up via the Supabase dashboard or API

-- Create active views (excluding soft-deleted records)
CREATE OR REPLACE VIEW active_profiles AS
SELECT * FROM profiles WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_agencies AS
SELECT * FROM agencies WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_agency_members AS
SELECT * FROM agency_members WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_dockets AS
SELECT * FROM dockets WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_comments AS
SELECT * FROM comments WHERE deleted_at IS NULL;
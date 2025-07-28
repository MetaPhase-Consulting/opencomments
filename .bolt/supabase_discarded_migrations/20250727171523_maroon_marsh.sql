/*
  # Comprehensive Audit System Implementation

  1. Standard Audit Columns
    - Add created_at, created_by, updated_at, updated_by, deleted_at to all main tables
    
  2. Audit Tables
    - Create audit tables for dockets, comments, agency_members, profiles
    - Automatic triggers to capture all changes
    
  3. Security
    - RLS policies for audit tables (Admin+ only)
    - Soft delete support with active views
    
  4. Cleanup
    - Remove unused tags system
    - Consolidate into single comprehensive migration
*/

-- Create audit action enum
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Generic audit function
CREATE OR REPLACE FUNCTION create_audit_record()
RETURNS TRIGGER AS $$
DECLARE
    audit_table_name TEXT;
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB;
BEGIN
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
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, auth.uid()),
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
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit columns to existing tables
DO $$
DECLARE
    table_name TEXT;
    tables_to_update TEXT[] := ARRAY['profiles', 'agencies', 'agency_members', 'dockets', 'comments'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_update
    LOOP
        -- Add created_by if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = table_name AND column_name = 'created_by'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN created_by UUID REFERENCES auth.users(id)', table_name);
        END IF;
        
        -- Add updated_by if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = table_name AND column_name = 'updated_by'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN updated_by UUID REFERENCES auth.users(id)', table_name);
        END IF;
        
        -- Add deleted_at if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = table_name AND column_name = 'deleted_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN deleted_at TIMESTAMPTZ', table_name);
        END IF;
    END LOOP;
END $$;

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

-- Add indexes for audit tables
CREATE INDEX IF NOT EXISTS idx_dockets_audit_record_id ON dockets_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_dockets_audit_timestamp ON dockets_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_audit_record_id ON comments_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_comments_audit_timestamp ON comments_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_record_id ON agency_members_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_timestamp ON agency_members_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_record_id ON profiles_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_timestamp ON profiles_audit(action_timestamp);

-- Add audit triggers to main tables
DROP TRIGGER IF EXISTS audit_dockets_trigger ON dockets;
CREATE TRIGGER audit_dockets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dockets
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

DROP TRIGGER IF EXISTS audit_comments_trigger ON comments;
CREATE TRIGGER audit_comments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

DROP TRIGGER IF EXISTS audit_agency_members_trigger ON agency_members;
CREATE TRIGGER audit_agency_members_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_members_updated_at ON agency_members;
CREATE TRIGGER update_agency_members_updated_at
    BEFORE UPDATE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dockets_updated_at ON dockets;
CREATE TRIGGER update_dockets_updated_at
    BEFORE UPDATE ON dockets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on audit tables
ALTER TABLE dockets_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit tables (Admin+ only)
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

-- Remove unused tags tables if they exist
DROP TABLE IF EXISTS docket_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS docket_tags CASCADE;

-- Clean up any unused indexes
DROP INDEX IF EXISTS idx_docket_tags_docket_id;
DROP INDEX IF EXISTS idx_docket_tags_tag_id;
DROP INDEX IF EXISTS idx_tags_name;
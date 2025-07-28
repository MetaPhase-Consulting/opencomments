/*
  # Implement Comprehensive Audit System

  1. Audit Infrastructure
    - Generic audit function and trigger
    - Standard audit columns on all main tables
    - Soft delete support

  2. Audit Tables
    - dockets_audit - Track all docket changes
    - comments_audit - Track comment lifecycle
    - agency_users_audit - Track role/permission changes

  3. Security
    - RLS on audit tables (Admin+ only)
    - Automatic capture via triggers
    - Immutable audit records

  4. Cleanup
    - Remove unused tags system
    - Consolidate tag functionality into dockets.tags array
*/

-- Remove unused tags system (tags are stored as array in dockets.tags)
DROP TABLE IF EXISTS docket_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Create generic audit function
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
    
    -- Handle different operations
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
        changed_fields := old_data;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        -- Only include changed fields
        changed_fields := jsonb_build_object();
        FOR key IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->key IS DISTINCT FROM new_data->key THEN
                changed_fields := changed_fields || jsonb_build_object(
                    key, jsonb_build_object(
                        'old', old_data->key,
                        'new', new_data->key
                    )
                );
            END IF;
        END LOOP;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
        changed_fields := new_data;
    END IF;
    
    -- Insert audit record using dynamic SQL
    EXECUTE format('
        INSERT INTO %I (
            record_id, action, actor_id, old_data, new_data, changed_fields, action_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        audit_table_name
    ) USING 
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        old_data,
        new_data,
        changed_fields,
        now();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add standard audit columns to existing tables
DO $$
BEGIN
    -- Add audit columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_by') THEN
        ALTER TABLE profiles 
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN updated_by uuid REFERENCES profiles(id),
        ADD COLUMN deleted_at timestamptz;
    END IF;
    
    -- Add audit columns to agencies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'created_by') THEN
        ALTER TABLE agencies 
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN updated_by uuid REFERENCES profiles(id),
        ADD COLUMN deleted_at timestamptz;
    END IF;
    
    -- Add audit columns to agency_members if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agency_members' AND column_name = 'created_by') THEN
        ALTER TABLE agency_members 
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN updated_by uuid REFERENCES profiles(id),
        ADD COLUMN deleted_at timestamptz;
    END IF;
    
    -- Add audit columns to dockets if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dockets' AND column_name = 'created_by') THEN
        ALTER TABLE dockets 
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN updated_by uuid REFERENCES profiles(id),
        ADD COLUMN deleted_at timestamptz;
    END IF;
    
    -- Add audit columns to comments if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'created_by') THEN
        ALTER TABLE comments 
        ADD COLUMN created_by uuid REFERENCES profiles(id),
        ADD COLUMN updated_by uuid REFERENCES profiles(id),
        ADD COLUMN deleted_at timestamptz;
    END IF;
END $$;

-- Create audit tables
CREATE TABLE IF NOT EXISTS dockets_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    actor_id uuid REFERENCES profiles(id),
    old_data jsonb,
    new_data jsonb,
    changed_fields jsonb,
    action_timestamp timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    actor_id uuid REFERENCES profiles(id),
    old_data jsonb,
    new_data jsonb,
    changed_fields jsonb,
    action_timestamp timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agency_members_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    actor_id uuid REFERENCES profiles(id),
    old_data jsonb,
    new_data jsonb,
    changed_fields jsonb,
    action_timestamp timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    actor_id uuid REFERENCES profiles(id),
    old_data jsonb,
    new_data jsonb,
    changed_fields jsonb,
    action_timestamp timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit tables
ALTER TABLE dockets_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit tables (Admin+ only)
CREATE POLICY "Agency admins can read docket audit logs"
    ON dockets_audit
    FOR SELECT
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
    ON comments_audit
    FOR SELECT
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
    ON agency_members_audit
    FOR SELECT
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

CREATE POLICY "Agency admins can read profile audit logs"
    ON profiles_audit
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members am
            WHERE am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
        )
    );

-- Create triggers for automatic audit capture
CREATE TRIGGER dockets_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON dockets
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER comments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER agency_members_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Create function to update updated_by column
CREATE OR REPLACE FUNCTION update_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add update triggers for audit columns
CREATE TRIGGER profiles_update_audit_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER agencies_update_audit_trigger
    BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER agency_members_update_audit_trigger
    BEFORE UPDATE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER dockets_update_audit_trigger
    BEFORE UPDATE ON dockets
    FOR EACH ROW EXECUTE FUNCTION update_audit_columns();

CREATE TRIGGER comments_update_audit_trigger
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_audit_columns();

-- Create indexes for audit tables
CREATE INDEX IF NOT EXISTS idx_dockets_audit_record_id ON dockets_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_dockets_audit_timestamp ON dockets_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_dockets_audit_actor ON dockets_audit(actor_id);

CREATE INDEX IF NOT EXISTS idx_comments_audit_record_id ON comments_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_comments_audit_timestamp ON comments_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_comments_audit_actor ON comments_audit(actor_id);

CREATE INDEX IF NOT EXISTS idx_agency_members_audit_record_id ON agency_members_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_timestamp ON agency_members_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_agency_members_audit_actor ON agency_members_audit(actor_id);

CREATE INDEX IF NOT EXISTS idx_profiles_audit_record_id ON profiles_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_timestamp ON profiles_audit(action_timestamp);
CREATE INDEX IF NOT EXISTS idx_profiles_audit_actor ON profiles_audit(actor_id);

-- Create soft delete views (exclude deleted records)
CREATE OR REPLACE VIEW active_dockets AS
SELECT * FROM dockets WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_comments AS
SELECT * FROM comments WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_agency_members AS
SELECT * FROM agency_members WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_profiles AS
SELECT * FROM profiles WHERE deleted_at IS NULL;

-- Grant permissions on views
GRANT SELECT ON active_dockets TO authenticated, anon;
GRANT SELECT ON active_comments TO authenticated, anon;
GRANT SELECT ON active_agency_members TO authenticated;
GRANT SELECT ON active_profiles TO authenticated;
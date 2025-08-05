/*
  # Agency Settings Implementation

  1. New Tables
    - `agency_settings` - Configuration settings for each agency
    - Enhanced `agencies` table with profile fields

  2. Security
    - Enable RLS on agency_settings table
    - Add policies for Owner/Admin edit access
    - Add audit triggers for all changes

  3. Features
    - Agency profile management
    - Comment window defaults
    - File upload settings
    - Branding configuration
*/

-- Add profile columns to agencies table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE agencies ADD COLUMN logo_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE agencies ADD COLUMN contact_email TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'jurisdiction_type'
    ) THEN
        ALTER TABLE agencies ADD COLUMN jurisdiction_type TEXT CHECK (jurisdiction_type IN ('state', 'county', 'city', 'district', 'other'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'public_slug'
    ) THEN
        ALTER TABLE agencies ADD COLUMN public_slug TEXT UNIQUE;
    END IF;
END $$;

-- Create agency_settings table
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Comment defaults
    max_file_size_mb INTEGER DEFAULT 10 CHECK (max_file_size_mb > 0 AND max_file_size_mb <= 100),
    allowed_mime_types TEXT[] DEFAULT ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
    captcha_enabled BOOLEAN DEFAULT true,
    auto_publish BOOLEAN DEFAULT false,
    
    -- Branding
    accent_color TEXT DEFAULT '#0050D8',
    footer_disclaimer TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(agency_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_settings_agency_id ON agency_settings(agency_id);

-- Enable RLS
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agency_settings
CREATE POLICY "Agency members can read settings"
    ON agency_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_members.agency_id = agency_settings.agency_id
            AND agency_members.user_id = auth.uid()
            AND agency_members.status = 'active'
            AND agency_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Agency owners and admins can update settings"
    ON agency_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_members.agency_id = agency_settings.agency_id
            AND agency_members.user_id = auth.uid()
            AND agency_members.role IN ('owner', 'admin')
            AND agency_members.status = 'active'
            AND agency_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Agency owners and admins can insert settings"
    ON agency_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_members.agency_id = agency_settings.agency_id
            AND agency_members.user_id = auth.uid()
            AND agency_members.role IN ('owner', 'admin')
            AND agency_members.status = 'active'
            AND agency_members.deleted_at IS NULL
        )
    );

-- Create audit table for agency_settings
CREATE TABLE IF NOT EXISTS agency_settings_audit (
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

-- Add indexes for audit table
CREATE INDEX IF NOT EXISTS idx_agency_settings_audit_record_id ON agency_settings_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_agency_settings_audit_timestamp ON agency_settings_audit(action_timestamp);

-- Enable RLS on audit table
ALTER TABLE agency_settings_audit ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit table (Admin+ only)
CREATE POLICY "Agency admins can read settings audit logs"
    ON agency_settings_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_settings s
            JOIN agency_members am ON am.agency_id = s.agency_id
            WHERE s.id = record_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
            AND am.status = 'active'
            AND am.deleted_at IS NULL
        )
    );

-- Add audit trigger for agency_settings
DROP TRIGGER IF EXISTS audit_agency_settings_trigger ON agency_settings;
CREATE TRIGGER audit_agency_settings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_settings
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Add updated_at trigger for agency_settings
DROP TRIGGER IF EXISTS update_agency_settings_updated_at ON agency_settings;
CREATE TRIGGER update_agency_settings_updated_at
    BEFORE UPDATE ON agency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize default settings for new agencies
CREATE OR REPLACE FUNCTION initialize_agency_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agency_settings (agency_id, created_by)
    VALUES (NEW.id, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings for new agencies
DROP TRIGGER IF EXISTS initialize_agency_settings_trigger ON agencies;
CREATE TRIGGER initialize_agency_settings_trigger
    AFTER INSERT ON agencies
    FOR EACH ROW EXECUTE FUNCTION initialize_agency_settings();

-- Function to transfer agency ownership
CREATE OR REPLACE FUNCTION transfer_agency_ownership(
    p_agency_id UUID,
    p_new_owner_id UUID
)
RETURNS VOID AS $$
DECLARE
    current_user_role agency_role;
    target_user_exists BOOLEAN;
BEGIN
    -- Check if current user is owner
    SELECT role INTO current_user_role
    FROM agency_members
    WHERE agency_id = p_agency_id 
    AND user_id = auth.uid()
    AND status = 'active'
    AND deleted_at IS NULL;

    IF current_user_role != 'owner' THEN
        RAISE EXCEPTION 'Only agency owners can transfer ownership';
    END IF;

    -- Check if target user exists and is a member
    SELECT EXISTS(
        SELECT 1 FROM agency_members
        WHERE agency_id = p_agency_id 
        AND user_id = p_new_owner_id
        AND status = 'active'
        AND deleted_at IS NULL
    ) INTO target_user_exists;

    IF NOT target_user_exists THEN
        RAISE EXCEPTION 'Target user must be an active agency member';
    END IF;

    -- Update current owner to admin
    UPDATE agency_members
    SET role = 'admin', updated_at = NOW(), updated_by = auth.uid()
    WHERE agency_id = p_agency_id 
    AND user_id = auth.uid();

    -- Update target user to owner
    UPDATE agency_members
    SET role = 'owner', updated_at = NOW(), updated_by = auth.uid()
    WHERE agency_id = p_agency_id 
    AND user_id = p_new_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive agency (soft delete)
CREATE OR REPLACE FUNCTION archive_agency(p_agency_id UUID)
RETURNS VOID AS $$
DECLARE
    current_user_role agency_role;
BEGIN
    -- Check if current user is owner
    SELECT role INTO current_user_role
    FROM agency_members
    WHERE agency_id = p_agency_id 
    AND user_id = auth.uid()
    AND status = 'active'
    AND deleted_at IS NULL;

    IF current_user_role != 'owner' THEN
        RAISE EXCEPTION 'Only agency owners can archive agencies';
    END IF;

    -- Soft delete agency
    UPDATE agencies
    SET deleted_at = NOW(), updated_at = NOW(), updated_by = auth.uid()
    WHERE id = p_agency_id;

    -- Soft delete all dockets
    UPDATE dockets
    SET deleted_at = NOW(), updated_at = NOW(), updated_by = auth.uid()
    WHERE agency_id = p_agency_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default settings for existing agencies
INSERT INTO agency_settings (agency_id, created_by)
SELECT id, created_by FROM agencies 
WHERE id NOT IN (SELECT agency_id FROM agency_settings)
ON CONFLICT (agency_id) DO NOTHING;

-- Generate public slugs for existing agencies if missing
UPDATE agencies 
SET public_slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE public_slug IS NULL;
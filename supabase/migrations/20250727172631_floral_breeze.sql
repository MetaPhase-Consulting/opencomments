/*
  # User & Role Administration System

  1. New Tables
    - `agency_invitations` - Track pending invites
    - Enhanced `agency_members` with status tracking
  
  2. Security
    - RLS policies for user management
    - Role-based access controls
    - Audit logging for permission changes
  
  3. Functions
    - Invite user functionality
    - Role change validation
    - Status management
*/

-- Add status tracking to agency_members if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agency_members' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE agency_members ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deactivated'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agency_members' 
        AND column_name = 'invited_at'
    ) THEN
        ALTER TABLE agency_members ADD COLUMN invited_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create agency invitations table
CREATE TABLE IF NOT EXISTS agency_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role agency_role NOT NULL DEFAULT 'reviewer',
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ
);

-- Add indexes for agency invitations
CREATE INDEX IF NOT EXISTS idx_agency_invitations_agency_id ON agency_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_email ON agency_invitations(email);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_token ON agency_invitations(token);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_expires_at ON agency_invitations(expires_at);

-- Enable RLS on agency invitations
ALTER TABLE agency_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for agency invitations
CREATE POLICY "Agency owners and admins can manage invitations"
    ON agency_invitations FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members am
            WHERE am.agency_id = agency_invitations.agency_id
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
            AND am.status = 'active'
        )
    );

-- Update agency_members RLS to include status check
DROP POLICY IF EXISTS "Agency owners and admins can manage members" ON agency_members;
CREATE POLICY "Agency owners and admins can manage members"
    ON agency_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members am2
            WHERE am2.agency_id = agency_members.agency_id
            AND am2.user_id = auth.uid()
            AND am2.role IN ('owner', 'admin')
            AND am2.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can read agency members for their agencies" ON agency_members;
CREATE POLICY "Users can read agency members for their agencies"
    ON agency_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members am2
            WHERE am2.agency_id = agency_members.agency_id
            AND am2.user_id = auth.uid()
            AND am2.status = 'active'
        )
    );

-- Function to invite user to agency
CREATE OR REPLACE FUNCTION invite_user_to_agency(
    p_agency_id UUID,
    p_email TEXT,
    p_role agency_role DEFAULT 'reviewer'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation_id UUID;
    v_user_role agency_role;
BEGIN
    -- Check if current user can invite (owner or admin)
    SELECT role INTO v_user_role
    FROM agency_members
    WHERE agency_id = p_agency_id
    AND user_id = auth.uid()
    AND status = 'active';
    
    IF v_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to invite users';
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM agency_members
        WHERE agency_id = p_agency_id
        AND user_id = (SELECT id FROM auth.users WHERE email = p_email)
    ) THEN
        RAISE EXCEPTION 'User is already a member of this agency';
    END IF;
    
    -- Check if there's already a pending invitation
    IF EXISTS (
        SELECT 1 FROM agency_invitations
        WHERE agency_id = p_agency_id
        AND email = p_email
        AND accepted_at IS NULL
        AND expires_at > NOW()
    ) THEN
        RAISE EXCEPTION 'User already has a pending invitation';
    END IF;
    
    -- Create invitation
    INSERT INTO agency_invitations (
        agency_id,
        email,
        role,
        invited_by,
        created_by,
        updated_by
    ) VALUES (
        p_agency_id,
        p_email,
        p_role,
        auth.uid(),
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO v_invitation_id;
    
    RETURN v_invitation_id;
END;
$$;

-- Function to accept agency invitation
CREATE OR REPLACE FUNCTION accept_agency_invitation(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation agency_invitations%ROWTYPE;
    v_member_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Get invitation
    SELECT * INTO v_invitation
    FROM agency_invitations
    WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;
    
    -- Check if user email matches invitation
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = v_user_id
        AND email = v_invitation.email
    ) THEN
        RAISE EXCEPTION 'User email does not match invitation';
    END IF;
    
    -- Create agency membership
    INSERT INTO agency_members (
        agency_id,
        user_id,
        role,
        invited_by,
        joined_at,
        invited_at,
        status,
        created_by,
        updated_by
    ) VALUES (
        v_invitation.agency_id,
        v_user_id,
        v_invitation.role,
        v_invitation.invited_by,
        NOW(),
        v_invitation.created_at,
        'active',
        v_user_id,
        v_user_id
    ) RETURNING id INTO v_member_id;
    
    -- Mark invitation as accepted
    UPDATE agency_invitations
    SET accepted_at = NOW(),
        updated_at = NOW(),
        updated_by = v_user_id
    WHERE id = v_invitation.id;
    
    RETURN v_member_id;
END;
$$;

-- Function to change user role
CREATE OR REPLACE FUNCTION change_user_role(
    p_member_id UUID,
    p_new_role agency_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member agency_members%ROWTYPE;
    v_current_user_role agency_role;
    v_role_levels INTEGER[] := ARRAY[1, 2, 3, 4, 5]; -- viewer, reviewer, manager, admin, owner
    v_current_level INTEGER;
    v_new_level INTEGER;
    v_user_level INTEGER;
BEGIN
    -- Get member details
    SELECT * INTO v_member
    FROM agency_members
    WHERE id = p_member_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Member not found';
    END IF;
    
    -- Get current user's role
    SELECT role INTO v_current_user_role
    FROM agency_members
    WHERE agency_id = v_member.agency_id
    AND user_id = auth.uid()
    AND status = 'active';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;
    
    -- Map roles to levels
    v_current_level := CASE v_member.role
        WHEN 'viewer' THEN 1
        WHEN 'reviewer' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'admin' THEN 4
        WHEN 'owner' THEN 5
    END;
    
    v_new_level := CASE p_new_role
        WHEN 'viewer' THEN 1
        WHEN 'reviewer' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'admin' THEN 4
        WHEN 'owner' THEN 5
    END;
    
    v_user_level := CASE v_current_user_role
        WHEN 'viewer' THEN 1
        WHEN 'reviewer' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'admin' THEN 4
        WHEN 'owner' THEN 5
    END;
    
    -- Check permissions
    IF v_current_user_role = 'owner' THEN
        -- Owners can change anyone's role
        NULL;
    ELSIF v_current_user_role = 'admin' THEN
        -- Admins can only change roles up to manager level
        IF v_new_level > 3 OR v_current_level > 3 THEN
            RAISE EXCEPTION 'Admins can only manage up to Manager level';
        END IF;
    ELSE
        RAISE EXCEPTION 'Insufficient permissions to change roles';
    END IF;
    
    -- Prevent removing the last owner
    IF v_member.role = 'owner' AND p_new_role != 'owner' THEN
        IF (SELECT COUNT(*) FROM agency_members 
            WHERE agency_id = v_member.agency_id 
            AND role = 'owner' 
            AND status = 'active') <= 1 THEN
            RAISE EXCEPTION 'Cannot remove the last owner';
        END IF;
    END IF;
    
    -- Update role
    UPDATE agency_members
    SET role = p_new_role,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = p_member_id;
    
    RETURN TRUE;
END;
$$;

-- Function to deactivate/reactivate user
CREATE OR REPLACE FUNCTION change_user_status(
    p_member_id UUID,
    p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member agency_members%ROWTYPE;
    v_current_user_role agency_role;
BEGIN
    -- Validate status
    IF p_status NOT IN ('active', 'deactivated') THEN
        RAISE EXCEPTION 'Invalid status. Must be active or deactivated';
    END IF;
    
    -- Get member details
    SELECT * INTO v_member
    FROM agency_members
    WHERE id = p_member_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Member not found';
    END IF;
    
    -- Get current user's role
    SELECT role INTO v_current_user_role
    FROM agency_members
    WHERE agency_id = v_member.agency_id
    AND user_id = auth.uid()
    AND status = 'active';
    
    IF v_current_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;
    
    -- Prevent deactivating the last owner
    IF v_member.role = 'owner' AND p_status = 'deactivated' THEN
        IF (SELECT COUNT(*) FROM agency_members 
            WHERE agency_id = v_member.agency_id 
            AND role = 'owner' 
            AND status = 'active') <= 1 THEN
            RAISE EXCEPTION 'Cannot deactivate the last owner';
        END IF;
    END IF;
    
    -- Update status
    UPDATE agency_members
    SET status = p_status,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = p_member_id;
    
    RETURN TRUE;
END;
$$;

-- Function to resend invitation
CREATE OR REPLACE FUNCTION resend_agency_invitation(p_invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation agency_invitations%ROWTYPE;
    v_current_user_role agency_role;
BEGIN
    -- Get invitation
    SELECT * INTO v_invitation
    FROM agency_invitations
    WHERE id = p_invitation_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invitation not found';
    END IF;
    
    -- Check permissions
    SELECT role INTO v_current_user_role
    FROM agency_members
    WHERE agency_id = v_invitation.agency_id
    AND user_id = auth.uid()
    AND status = 'active';
    
    IF v_current_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;
    
    -- Update invitation expiry
    UPDATE agency_invitations
    SET expires_at = NOW() + INTERVAL '7 days',
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = p_invitation_id;
    
    RETURN TRUE;
END;
$$;

-- Add audit trigger for agency_members
DROP TRIGGER IF EXISTS audit_agency_members_trigger ON agency_members;
CREATE TRIGGER audit_agency_members_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_members
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Add audit trigger for agency_invitations
DROP TRIGGER IF EXISTS audit_agency_invitations_trigger ON agency_invitations;
CREATE TRIGGER audit_agency_invitations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON agency_invitations
    FOR EACH ROW EXECUTE FUNCTION create_audit_record();

-- Create agency_invitations_audit table
CREATE TABLE IF NOT EXISTS agency_invitations_audit (
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

-- Add indexes for agency_invitations_audit
CREATE INDEX IF NOT EXISTS idx_agency_invitations_audit_record_id ON agency_invitations_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_agency_invitations_audit_timestamp ON agency_invitations_audit(action_timestamp);

-- Enable RLS on agency_invitations_audit
ALTER TABLE agency_invitations_audit ENABLE ROW LEVEL SECURITY;

-- RLS policy for agency_invitations_audit
CREATE POLICY "Agency admins can read invitation audit logs"
    ON agency_invitations_audit FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_invitations ai
            JOIN agency_members am ON am.agency_id = ai.agency_id
            WHERE ai.id = record_id 
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'admin')
            AND am.status = 'active'
        )
    );

-- Update existing RLS policies to check status = 'active'
DROP POLICY IF EXISTS "Agency members can read dockets" ON dockets;
CREATE POLICY "Agency members can read dockets"
    ON dockets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_id = dockets.agency_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Agency managers+ can create dockets" ON dockets;
CREATE POLICY "Agency managers+ can create dockets"
    ON dockets FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_id = dockets.agency_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'manager')
            AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Agency managers+ can update dockets" ON dockets;
CREATE POLICY "Agency managers+ can update dockets"
    ON dockets FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agency_members
            WHERE agency_id = dockets.agency_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'manager')
            AND status = 'active'
        )
    );
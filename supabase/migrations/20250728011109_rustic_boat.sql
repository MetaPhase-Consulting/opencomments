/*
  # Create Platform Roles System
  
  1. New Tables
    - `platform_roles`
      - `user_id` (uuid, primary key, references profiles)
      - `role` (text, check constraint for super_owner/super_user)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references profiles)
  
  2. Security
    - Enable RLS on `platform_roles` table
    - Add policies for platform role management
    - Restrict access to approved email domains
  
  3. Functions
    - Helper functions for role checking
    - Domain validation functions
*/

-- Create platform_roles table
CREATE TABLE IF NOT EXISTS platform_roles (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_owner', 'super_user')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE platform_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_roles_role ON platform_roles(role);
CREATE INDEX IF NOT EXISTS idx_platform_roles_created_at ON platform_roles(created_at);

-- Helper function to check if email domain is approved for platform roles
CREATE OR REPLACE FUNCTION is_approved_platform_domain(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '@(metaphaseconsulting\.com|metaphase\.tech|opencomments\.us)$';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has platform role
CREATE OR REPLACE FUNCTION has_platform_role(user_id uuid, required_role text DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM platform_roles
  WHERE platform_roles.user_id = has_platform_role.user_id;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  IF required_role IS NULL THEN
    RETURN true; -- Any platform role
  END IF;
  
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super owner
CREATE OR REPLACE FUNCTION is_super_owner(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN has_platform_role(user_id, 'super_owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super user or super owner
CREATE OR REPLACE FUNCTION is_super_user_or_owner(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN has_platform_role(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Users can read their own platform role
CREATE POLICY "Users can read own platform role"
  ON platform_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Super owners can read all platform roles
CREATE POLICY "Super owners can read all platform roles"
  ON platform_roles
  FOR SELECT
  TO authenticated
  USING (is_super_owner());

-- Only super owners can insert/update/delete platform roles
CREATE POLICY "Super owners can manage platform roles"
  ON platform_roles
  FOR ALL
  TO authenticated
  USING (is_super_owner())
  WITH CHECK (
    is_super_owner() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = platform_roles.user_id
      AND is_approved_platform_domain(profiles.email)
    )
  );

-- Function to create new agency (for platform admins)
CREATE OR REPLACE FUNCTION create_agency_with_owner(
  p_agency_name text,
  p_jurisdiction text DEFAULT NULL,
  p_jurisdiction_type text DEFAULT 'city',
  p_description text DEFAULT NULL,
  p_owner_email text,
  p_owner_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_agency_id uuid;
  v_owner_id uuid;
  v_public_slug text;
BEGIN
  -- Check if caller has platform role
  IF NOT is_super_user_or_owner() THEN
    RAISE EXCEPTION 'Access denied: Platform role required';
  END IF;
  
  -- Validate owner email domain (should be government domain)
  IF NOT (p_owner_email ~* '\.(gov|edu)$') THEN
    RAISE EXCEPTION 'Owner email must be from a government domain (.gov or .edu)';
  END IF;
  
  -- Generate public slug from agency name
  v_public_slug := lower(regexp_replace(p_agency_name, '[^a-zA-Z0-9\s]', '', 'g'));
  v_public_slug := regexp_replace(v_public_slug, '\s+', '-', 'g');
  v_public_slug := trim(both '-' from v_public_slug);
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM agencies WHERE public_slug = v_public_slug) LOOP
    v_public_slug := v_public_slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  -- Create agency
  INSERT INTO agencies (
    name,
    jurisdiction,
    jurisdiction_type,
    description,
    public_slug,
    created_by,
    updated_by
  ) VALUES (
    p_agency_name,
    p_jurisdiction,
    p_jurisdiction_type,
    p_description,
    v_public_slug,
    auth.uid(),
    auth.uid()
  ) RETURNING id INTO v_agency_id;
  
  -- Check if owner user already exists
  SELECT id INTO v_owner_id
  FROM profiles
  WHERE email = p_owner_email;
  
  -- If owner doesn't exist, create profile
  IF v_owner_id IS NULL THEN
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      created_by,
      updated_by
    ) VALUES (
      gen_random_uuid(),
      p_owner_email,
      p_owner_name,
      'agency',
      auth.uid(),
      auth.uid()
    ) RETURNING id INTO v_owner_id;
  ELSE
    -- Update existing profile to agency role if needed
    UPDATE profiles
    SET 
      role = 'agency',
      full_name = COALESCE(p_owner_name, full_name),
      updated_at = now(),
      updated_by = auth.uid()
    WHERE id = v_owner_id;
  END IF;
  
  -- Add owner as agency member
  INSERT INTO agency_members (
    agency_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at,
    created_by,
    updated_by
  ) VALUES (
    v_agency_id,
    v_owner_id,
    'owner',
    'active',
    auth.uid(),
    now(),
    auth.uid(),
    auth.uid()
  );
  
  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite user to agency (for platform admins)
CREATE OR REPLACE FUNCTION platform_invite_user_to_agency(
  p_agency_id uuid,
  p_email text,
  p_role agency_role,
  p_full_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_invitation_id uuid;
BEGIN
  -- Check if caller has platform role
  IF NOT is_super_user_or_owner() THEN
    RAISE EXCEPTION 'Access denied: Platform role required';
  END IF;
  
  -- Super users cannot assign owner role (only super owners can)
  IF p_role = 'owner' AND NOT is_super_owner() THEN
    RAISE EXCEPTION 'Access denied: Only super owners can assign owner role';
  END IF;
  
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_email;
  
  -- If user doesn't exist, create profile
  IF v_user_id IS NULL THEN
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      created_by,
      updated_by
    ) VALUES (
      gen_random_uuid(),
      p_email,
      p_full_name,
      'agency',
      auth.uid(),
      auth.uid()
    ) RETURNING id INTO v_user_id;
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM agency_members
    WHERE agency_id = p_agency_id AND user_id = v_user_id
    AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is already a member of this agency';
  END IF;
  
  -- Create agency membership
  INSERT INTO agency_members (
    agency_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at,
    created_by,
    updated_by
  ) VALUES (
    p_agency_id,
    v_user_id,
    p_role,
    'active',
    auth.uid(),
    now(),
    auth.uid(),
    auth.uid()
  ) RETURNING id INTO v_invitation_id;
  
  RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update agency_members policies to allow platform admin access
CREATE POLICY "Platform admins can manage all agency members"
  ON agency_members
  FOR ALL
  TO authenticated
  USING (is_super_owner())
  WITH CHECK (is_super_owner());

-- Update agencies policies to allow platform admin access
CREATE POLICY "Platform admins can manage all agencies"
  ON agencies
  FOR ALL
  TO authenticated
  USING (is_super_owner())
  WITH CHECK (is_super_owner());

-- Update profiles policies to allow platform admin access
CREATE POLICY "Platform admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_super_owner())
  WITH CHECK (is_super_owner());
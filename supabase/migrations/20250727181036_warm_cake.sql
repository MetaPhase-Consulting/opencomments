/*
  # Authenticated Comment Submission & Integrity Controls
  
  1. New Tables
     - `commenter_info`: Stores representation and certification data
     - `comment_rate_limits`: Tracks submission rates for anti-spam
  
  2. Extended Tables
     - `comments`: Added OAuth provider, metadata, and audit columns
     - `dockets`: Added submission rules and limits
  
  3. Security
     - RLS policies for authenticated comment submission
     - Rate limiting and duplicate detection
     - Metadata capture triggers
  
  4. Functions
     - `can_submit_comment`: Rate limiting and validation
     - `submit_authenticated_comment`: Complete submission workflow
*/

-- Add OAuth and metadata columns to comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'oauth_provider'
  ) THEN
    ALTER TABLE comments ADD COLUMN oauth_provider text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'oauth_uid'
  ) THEN
    ALTER TABLE comments ADD COLUMN oauth_uid text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'geo_country'
  ) THEN
    ALTER TABLE comments ADD COLUMN geo_country text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE comments ADD COLUMN content_hash text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'captcha_token'
  ) THEN
    ALTER TABLE comments ADD COLUMN captcha_token text;
  END IF;
END $$;

-- Add submission rules to dockets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'max_comment_length'
  ) THEN
    ALTER TABLE dockets ADD COLUMN max_comment_length integer DEFAULT 4000;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'max_comments_per_user'
  ) THEN
    ALTER TABLE dockets ADD COLUMN max_comments_per_user integer DEFAULT 3;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'uploads_enabled'
  ) THEN
    ALTER TABLE dockets ADD COLUMN uploads_enabled boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'max_files_per_comment'
  ) THEN
    ALTER TABLE dockets ADD COLUMN max_files_per_comment integer DEFAULT 3;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'allowed_mime_types'
  ) THEN
    ALTER TABLE dockets ADD COLUMN allowed_mime_types text[] DEFAULT ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
  END IF;
END $$;

-- Create commenter_info table
CREATE TABLE IF NOT EXISTS commenter_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  representation text NOT NULL CHECK (representation IN ('myself', 'organization', 'behalf_of_another')),
  organization_name text,
  authorization_statement text,
  perjury_certified boolean NOT NULL DEFAULT false,
  certification_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create comment_rate_limits table for anti-spam
CREATE TABLE IF NOT EXISTS comment_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  docket_id uuid REFERENCES dockets(id),
  submission_count integer DEFAULT 1,
  last_submission timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_commenter_info_comment_id ON commenter_info(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_rate_limits_user_id ON comment_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_rate_limits_ip_address ON comment_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_comment_rate_limits_docket_id ON comment_rate_limits(docket_id);
CREATE INDEX IF NOT EXISTS idx_comments_oauth_provider ON comments(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_comments_oauth_uid ON comments(oauth_uid);
CREATE INDEX IF NOT EXISTS idx_comments_content_hash ON comments(content_hash);

-- Function to check if user can submit comment
CREATE OR REPLACE FUNCTION can_submit_comment(
  p_user_id uuid,
  p_docket_id uuid,
  p_ip_address inet,
  p_content_hash text
) RETURNS jsonb AS $$
DECLARE
  v_docket record;
  v_user_comment_count integer;
  v_ip_rate_limit integer;
  v_duplicate_count integer;
BEGIN
  -- Get docket submission rules
  SELECT max_comments_per_user INTO v_docket
  FROM dockets 
  WHERE id = p_docket_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Docket not found');
  END IF;
  
  -- Check user comment limit per docket
  SELECT COUNT(*) INTO v_user_comment_count
  FROM comments 
  WHERE user_id = p_user_id AND docket_id = p_docket_id;
  
  IF v_user_comment_count >= COALESCE(v_docket.max_comments_per_user, 3) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Maximum comments per user exceeded');
  END IF;
  
  -- Check IP rate limit (10 comments per hour)
  SELECT COUNT(*) INTO v_ip_rate_limit
  FROM comments 
  WHERE ip_address = p_ip_address 
    AND created_at > now() - interval '1 hour';
  
  IF v_ip_rate_limit >= 10 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Rate limit exceeded');
  END IF;
  
  -- Check for duplicate content (last 10 minutes)
  SELECT COUNT(*) INTO v_duplicate_count
  FROM comments 
  WHERE content_hash = p_content_hash 
    AND created_at > now() - interval '10 minutes';
  
  IF v_duplicate_count > 0 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Duplicate comment detected');
  END IF;
  
  RETURN jsonb_build_object('allowed', true, 'reason', 'OK');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit authenticated comment
CREATE OR REPLACE FUNCTION submit_authenticated_comment(
  p_docket_slug text,
  p_content text,
  p_commenter_name text DEFAULT NULL,
  p_commenter_email text DEFAULT NULL,
  p_commenter_organization text DEFAULT NULL,
  p_representation text DEFAULT 'myself',
  p_organization_name text DEFAULT NULL,
  p_authorization_statement text DEFAULT NULL,
  p_perjury_certified boolean DEFAULT false,
  p_captcha_token text DEFAULT NULL,
  p_oauth_provider text DEFAULT NULL,
  p_oauth_uid text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_docket record;
  v_comment_id uuid;
  v_tracking_id text;
  v_content_hash text;
  v_can_submit jsonb;
  v_user_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Validate perjury certification
  IF NOT p_perjury_certified THEN
    RETURN jsonb_build_object('success', false, 'error', 'Perjury certification required');
  END IF;
  
  -- Get docket information
  SELECT d.*, a.name as agency_name
  INTO v_docket
  FROM dockets d
  JOIN agencies a ON a.id = d.agency_id
  WHERE d.slug = p_docket_slug 
    AND d.status = 'open'
    AND (d.close_at IS NULL OR d.close_at > now());
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Docket not found or closed');
  END IF;
  
  -- Validate content length
  IF length(p_content) > COALESCE(v_docket.max_comment_length, 4000) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comment exceeds maximum length');
  END IF;
  
  -- Generate content hash for duplicate detection
  v_content_hash := encode(digest(p_content, 'sha256'), 'hex');
  
  -- Check if user can submit
  v_can_submit := can_submit_comment(v_user_id, v_docket.id, p_ip_address, v_content_hash);
  
  IF NOT (v_can_submit->>'allowed')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', v_can_submit->>'reason');
  END IF;
  
  -- Generate tracking ID
  v_tracking_id := upper(substring(encode(gen_random_bytes(8), 'base64'), 1, 12));
  
  -- Insert comment
  INSERT INTO comments (
    docket_id,
    user_id,
    content,
    status,
    commenter_name,
    commenter_email,
    commenter_organization,
    oauth_provider,
    oauth_uid,
    ip_address,
    user_agent,
    content_hash,
    captcha_token,
    created_at
  ) VALUES (
    v_docket.id,
    v_user_id,
    p_content,
    CASE WHEN v_docket.auto_publish THEN 'published' ELSE 'submitted' END,
    p_commenter_name,
    p_commenter_email,
    p_commenter_organization,
    p_oauth_provider,
    p_oauth_uid,
    p_ip_address,
    p_user_agent,
    v_content_hash,
    p_captcha_token,
    now()
  ) RETURNING id INTO v_comment_id;
  
  -- Insert commenter info
  INSERT INTO commenter_info (
    comment_id,
    representation,
    organization_name,
    authorization_statement,
    perjury_certified,
    certification_timestamp
  ) VALUES (
    v_comment_id,
    p_representation,
    p_organization_name,
    p_authorization_statement,
    p_perjury_certified,
    now()
  );
  
  -- Update rate limiting
  INSERT INTO comment_rate_limits (user_id, ip_address, docket_id, submission_count, last_submission)
  VALUES (v_user_id, p_ip_address, v_docket.id, 1, now())
  ON CONFLICT (user_id, docket_id) 
  DO UPDATE SET 
    submission_count = comment_rate_limits.submission_count + 1,
    last_submission = now(),
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'comment_id', v_comment_id,
    'tracking_id', v_tracking_id,
    'docket_title', v_docket.title,
    'agency_name', v_docket.agency_name,
    'status', CASE WHEN v_docket.auto_publish THEN 'published' ELSE 'submitted' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE commenter_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for commenter_info
CREATE POLICY "Users can read own commenter info" ON commenter_info
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM comments 
  WHERE comments.id = commenter_info.comment_id 
  AND comments.user_id = auth.uid()
));

CREATE POLICY "Agency members can read commenter info" ON commenter_info
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM comments c
  JOIN dockets d ON d.id = c.docket_id
  JOIN agency_members am ON am.agency_id = d.agency_id
  WHERE c.id = commenter_info.comment_id 
  AND am.user_id = auth.uid()
));

-- RLS policies for comment_rate_limits
CREATE POLICY "Users can read own rate limits" ON comment_rate_limits
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Agency members can read rate limits for their dockets" ON comment_rate_limits
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM dockets d
  JOIN agency_members am ON am.agency_id = d.agency_id
  WHERE d.id = comment_rate_limits.docket_id 
  AND am.user_id = auth.uid()
));

-- Update comments RLS for authenticated submission
CREATE POLICY "Authenticated users can insert comments" ON comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger to populate geo_country (placeholder for now)
CREATE OR REPLACE FUNCTION populate_comment_metadata()
RETURNS trigger AS $$
BEGIN
  -- Placeholder for geo-location lookup
  -- In production, this would use a GeoIP service
  NEW.geo_country := 'US';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_populate_comment_metadata
BEFORE INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION populate_comment_metadata();
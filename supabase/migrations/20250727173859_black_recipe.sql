/*
  # Reports & Exports System

  1. New Tables
    - `exports`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, foreign key)
      - `docket_id` (uuid, nullable - for docket-specific exports)
      - `export_type` (enum: csv, zip, combined)
      - `filters_json` (jsonb - export parameters)
      - `file_url` (text - signed URL to download)
      - `file_path` (text - storage path)
      - `size_bytes` (bigint)
      - `status` (enum: pending, processing, completed, failed, expired)
      - `progress_percent` (integer, 0-100)
      - `error_message` (text, nullable)
      - `expires_at` (timestamptz - 24h from completion)
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage Buckets
    - `agency-exports` bucket for temporary export files

  3. Security
    - Enable RLS on `exports` table
    - Add policies for agency members to manage their exports
    - Add cleanup function for expired exports

  4. Functions
    - Export generation functions
    - Analytics aggregation functions
*/

-- Create export type enum
CREATE TYPE export_type AS ENUM ('csv', 'zip', 'combined');

-- Create export status enum  
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE,
  export_type export_type NOT NULL,
  filters_json jsonb DEFAULT '{}',
  file_url text,
  file_path text,
  size_bytes bigint DEFAULT 0,
  status export_status DEFAULT 'pending',
  progress_percent integer DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  error_message text,
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exports_agency_id ON exports(agency_id);
CREATE INDEX IF NOT EXISTS idx_exports_docket_id ON exports(docket_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created_by ON exports(created_by);
CREATE INDEX IF NOT EXISTS idx_exports_expires_at ON exports(expires_at);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON exports(created_at);

-- Enable RLS
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Agency members can view exports for their agency"
  ON exports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = exports.agency_id 
      AND agency_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers+ can create exports"
  ON exports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_members 
      WHERE agency_members.agency_id = exports.agency_id 
      AND agency_members.user_id = auth.uid()
      AND agency_members.role IN ('owner', 'admin', 'manager', 'reviewer')
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update their own exports"
  ON exports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exports"
  ON exports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Updated at trigger
CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get agency analytics
CREATE OR REPLACE FUNCTION get_agency_analytics(p_agency_id uuid, p_date_from timestamptz DEFAULT NULL, p_date_to timestamptz DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  date_filter_start timestamptz;
  date_filter_end timestamptz;
BEGIN
  -- Set default date range (last 90 days if not specified)
  date_filter_start := COALESCE(p_date_from, now() - interval '90 days');
  date_filter_end := COALESCE(p_date_to, now());

  -- Check if user has access to this agency
  IF NOT EXISTS (
    SELECT 1 FROM agency_members 
    WHERE agency_id = p_agency_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to agency analytics';
  END IF;

  -- Build analytics object
  SELECT jsonb_build_object(
    'total_dockets', (
      SELECT COUNT(*) FROM dockets 
      WHERE agency_id = p_agency_id 
      AND created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'active_dockets', (
      SELECT COUNT(*) FROM dockets 
      WHERE agency_id = p_agency_id 
      AND status = 'open'
    ),
    'total_comments', (
      SELECT COUNT(*) FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id 
      AND c.created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'approved_comments', (
      SELECT COUNT(*) FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id 
      AND c.status = 'published'
      AND c.created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'pending_comments', (
      SELECT COUNT(*) FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id 
      AND c.status IN ('submitted', 'under_review')
    ),
    'total_attachments', (
      SELECT COUNT(*) FROM comment_attachments ca
      JOIN comments c ON c.id = ca.comment_id
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id
      AND ca.created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'total_attachment_size_mb', (
      SELECT COALESCE(ROUND(SUM(ca.file_size) / 1024.0 / 1024.0, 2), 0) FROM comment_attachments ca
      JOIN comments c ON c.id = ca.comment_id
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id
      AND ca.created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'avg_comments_per_docket', (
      SELECT COALESCE(ROUND(AVG(comment_count), 1), 0) FROM (
        SELECT COUNT(c.id) as comment_count
        FROM dockets d
        LEFT JOIN comments c ON c.docket_id = d.id
        WHERE d.agency_id = p_agency_id
        AND d.created_at BETWEEN date_filter_start AND date_filter_end
        GROUP BY d.id
      ) subq
    ),
    'unique_commenters', (
      SELECT COUNT(DISTINCT c.commenter_email) FROM comments c
      JOIN dockets d ON d.id = c.docket_id
      WHERE d.agency_id = p_agency_id 
      AND c.commenter_email IS NOT NULL
      AND c.created_at BETWEEN date_filter_start AND date_filter_end
    ),
    'date_range', jsonb_build_object(
      'from', date_filter_start,
      'to', date_filter_end
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to create export job
CREATE OR REPLACE FUNCTION create_export_job(
  p_agency_id uuid,
  p_docket_id uuid DEFAULT NULL,
  p_export_type export_type,
  p_filters jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  export_id uuid;
  user_role agency_role;
BEGIN
  -- Check if user has access to this agency and required permissions
  SELECT role INTO user_role
  FROM agency_members 
  WHERE agency_id = p_agency_id 
  AND user_id = auth.uid();

  IF user_role IS NULL THEN
    RAISE EXCEPTION 'Access denied to agency';
  END IF;

  IF user_role = 'viewer' THEN
    RAISE EXCEPTION 'Insufficient permissions to create exports';
  END IF;

  -- Create export record
  INSERT INTO exports (
    agency_id,
    docket_id,
    export_type,
    filters_json,
    created_by,
    expires_at
  ) VALUES (
    p_agency_id,
    p_docket_id,
    p_export_type,
    p_filters,
    auth.uid(),
    now() + interval '24 hours'
  ) RETURNING id INTO export_id;

  RETURN export_id;
END;
$$;

-- Function to update export progress
CREATE OR REPLACE FUNCTION update_export_progress(
  p_export_id uuid,
  p_status export_status,
  p_progress_percent integer DEFAULT NULL,
  p_file_path text DEFAULT NULL,
  p_file_url text DEFAULT NULL,
  p_size_bytes bigint DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE exports SET
    status = p_status,
    progress_percent = COALESCE(p_progress_percent, progress_percent),
    file_path = COALESCE(p_file_path, file_path),
    file_url = COALESCE(p_file_url, file_url),
    size_bytes = COALESCE(p_size_bytes, size_bytes),
    error_message = p_error_message,
    updated_at = now()
  WHERE id = p_export_id;
END;
$$;

-- Function to cleanup expired exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark exports as expired
  UPDATE exports 
  SET status = 'expired', updated_at = now()
  WHERE expires_at < now() 
  AND status = 'completed';

  -- Delete old expired exports (older than 7 days)
  DELETE FROM exports 
  WHERE status = 'expired' 
  AND updated_at < now() - interval '7 days';
END;
$$;
/*
  # Fix Enum Conversion Issues
  
  This migration fixes all enum conversion issues by:
  1. Dropping all policies that depend on status columns
  2. Converting text columns to enums
  3. Recreating policies with proper enum types
*/

-- Drop all policies that depend on status columns
DROP POLICY IF EXISTS "Public can read open dockets" ON dockets;
DROP POLICY IF EXISTS "Agencies can manage own dockets" ON dockets;
DROP POLICY IF EXISTS "Public can read approved comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments on open dockets" ON comments;
DROP POLICY IF EXISTS "Agency reviewers+ can update comment status" ON comments;
DROP POLICY IF EXISTS "Public can read attachments for open dockets" ON docket_attachments;

-- Convert dockets status to enum
DO $$
BEGIN
  -- Drop default if exists
  ALTER TABLE dockets ALTER COLUMN status DROP DEFAULT;
  -- Convert to enum
  ALTER TABLE dockets ALTER COLUMN status TYPE docket_status USING status::docket_status;
  -- Add default back
  ALTER TABLE dockets ALTER COLUMN status SET DEFAULT 'draft';
END $$;

-- Convert comments status to enum
DO $$
BEGIN
  -- Drop default if exists
  ALTER TABLE comments ALTER COLUMN status DROP DEFAULT;
  -- Convert to enum
  ALTER TABLE comments ALTER COLUMN status TYPE comment_status USING status::comment_status;
  -- Add default back
  ALTER TABLE comments ALTER COLUMN status SET DEFAULT 'pending';
END $$;

-- Recreate policies with proper enum types
CREATE POLICY "Public can read open dockets"
  ON dockets
  FOR SELECT
  TO authenticated, anon
  USING (status = 'open'::docket_status);

CREATE POLICY "Agencies can manage own dockets"
  ON dockets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'agency'
      AND profiles.id = dockets.agency_id
    )
  );

CREATE POLICY "Public can read approved comments"
  ON comments
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'::comment_status AND
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE dockets.id = comments.docket_id 
      AND dockets.status = 'open'::docket_status
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
      AND dockets.status = 'open'::docket_status
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
      JOIN agency_users am ON am.agency_id = d.agency_id
      WHERE d.id = comments.docket_id 
      AND am.user_id = auth.uid()
      AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
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
      AND dockets.status = 'open'::docket_status
    )
  ); 
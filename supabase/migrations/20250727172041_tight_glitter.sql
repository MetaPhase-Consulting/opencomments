/*
  # Moderation Queue Setup

  1. Storage Setup
    - Create comment-attachments bucket
    - Set up proper RLS policies for file access

  2. Tables
    - Update comments table with status column
    - Create comment_attachments table
    - Add moderation_logs table

  3. Security
    - RLS policies for moderation access
    - File access controls

  4. Triggers
    - Audit logging for status changes
    - Auto-update timestamps
*/

-- Create storage bucket for comment attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('comment-attachments', 'comment-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for comment attachments
CREATE POLICY "Agency members can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comment-attachments' AND
  EXISTS (
    SELECT 1 FROM comments c
    JOIN dockets d ON d.id = c.docket_id
    JOIN agency_members am ON am.agency_id = d.agency_id
    WHERE am.user_id = auth.uid()
    AND (storage.foldername(name))[3] = c.id::text
  )
);

CREATE POLICY "Public can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comment-attachments' AND
  (storage.foldername(name))[1] = 'agency'
);

-- Update comments table with status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'status'
  ) THEN
    ALTER TABLE comments ADD COLUMN status comment_status DEFAULT 'pending';
  END IF;
END $$;

-- Create comment_attachments table if not exists
CREATE TABLE IF NOT EXISTS comment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comment_attachments
CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment_id ON comment_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_attachments_uploaded_at ON comment_attachments(uploaded_at);

-- Enable RLS on comment_attachments
ALTER TABLE comment_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_attachments
CREATE POLICY "Agency members can read comment attachments"
ON comment_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM comments c
    JOIN dockets d ON d.id = c.docket_id
    JOIN agency_members am ON am.agency_id = d.agency_id
    WHERE c.id = comment_attachments.comment_id
    AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attachments for their comments"
ON comment_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM comments c
    WHERE c.id = comment_attachments.comment_id
    AND c.user_id = auth.uid()
  )
);

-- Create moderation_logs table if not exists
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

-- Create indexes for moderation_logs
CREATE INDEX IF NOT EXISTS idx_moderation_logs_comment_id ON moderation_logs(comment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_actor_id ON moderation_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at);

-- Enable RLS on moderation_logs
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for moderation_logs
CREATE POLICY "Agency members can read moderation logs for their dockets"
ON moderation_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM comments c
    JOIN dockets d ON d.id = c.docket_id
    JOIN agency_members am ON am.agency_id = d.agency_id
    WHERE c.id = moderation_logs.comment_id
    AND am.user_id = auth.uid()
  )
);

CREATE POLICY "Agency reviewers+ can create moderation logs"
ON moderation_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM comments c
    JOIN dockets d ON d.id = c.docket_id
    JOIN agency_members am ON am.agency_id = d.agency_id
    WHERE c.id = moderation_logs.comment_id
    AND am.user_id = auth.uid()
    AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
  ) AND actor_id = auth.uid()
);

-- Function to log moderation actions
CREATE OR REPLACE FUNCTION log_comment_moderation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO moderation_logs (
      comment_id,
      action,
      actor_id,
      previous_status,
      new_status
    ) VALUES (
      NEW.id,
      CASE NEW.status
        WHEN 'approved' THEN 'approve'
        WHEN 'rejected' THEN 'reject'
        WHEN 'flagged' THEN 'flag'
        ELSE 'edit'
      END::moderation_action,
      COALESCE(NEW.updated_by, auth.uid()),
      OLD.status,
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment moderation logging
DROP TRIGGER IF EXISTS log_comment_moderation_trigger ON comments;
CREATE TRIGGER log_comment_moderation_trigger
  AFTER UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION log_comment_moderation();

-- Function to get signed URL for attachment
CREATE OR REPLACE FUNCTION get_attachment_signed_url(attachment_id UUID)
RETURNS TEXT AS $$
DECLARE
  file_path TEXT;
BEGIN
  SELECT comment_attachments.file_path INTO file_path
  FROM comment_attachments
  WHERE id = attachment_id;
  
  IF file_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the file path - signed URL generation will be handled by the client
  RETURN file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comments RLS policies for moderation access
DROP POLICY IF EXISTS "Agency reviewers+ can update comment status" ON comments;
CREATE POLICY "Agency reviewers+ can update comment status"
ON comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dockets d
    JOIN agency_members am ON am.agency_id = d.agency_id
    WHERE d.id = comments.docket_id
    AND am.user_id = auth.uid()
    AND am.role IN ('owner', 'admin', 'manager', 'reviewer')
  )
);

-- Add helpful view for moderation queue
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
  COUNT(ca.id) as attachment_count,
  ARRAY_AGG(
    CASE WHEN ca.id IS NOT NULL THEN
      jsonb_build_object(
        'id', ca.id,
        'filename', ca.filename,
        'file_size', ca.file_size,
        'mime_type', ca.mime_type
      )
    END
  ) FILTER (WHERE ca.id IS NOT NULL) as attachments
FROM comments c
JOIN dockets d ON d.id = c.docket_id
LEFT JOIN comment_attachments ca ON ca.comment_id = c.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.docket_id, c.content, c.status, c.commenter_name, 
         c.commenter_email, c.commenter_organization, c.created_at, 
         c.updated_at, d.title, d.agency_id;
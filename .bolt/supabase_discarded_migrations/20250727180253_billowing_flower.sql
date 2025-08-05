/*
  # Public Comment System

  1. New Tables
    - `public_comment_submissions` - Stores public comments from citizens
    - `public_comment_attachments` - File attachments for public comments

  2. RLS Policies
    - Allow public to insert comments on open dockets
    - Allow public to read approved comments only
    - Prevent access to pending/rejected comments

  3. Functions
    - `submit_public_comment` - RPC for comment submission
    - `get_public_dockets` - Get open dockets for public browsing
*/

-- Create public comment submissions table
CREATE TABLE IF NOT EXISTS public_comment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE,
  commenter_name text,
  commenter_email text,
  commenter_organization text,
  content text NOT NULL,
  status comment_status DEFAULT 'pending',
  tracking_id text UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create public comment attachments table
CREATE TABLE IF NOT EXISTS public_comment_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES public_comment_submissions(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_path text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public_comment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_comment_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public comment submissions
CREATE POLICY "Anyone can insert comments on open dockets"
  ON public_comment_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dockets 
      WHERE id = docket_id 
      AND status = 'open' 
      AND (close_at IS NULL OR close_at > now())
    )
  );

CREATE POLICY "Public can read approved comments"
  ON public_comment_submissions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Agency members can read all comments for their dockets"
  ON public_comment_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dockets d
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE d.id = docket_id AND am.user_id = auth.uid()
    )
  );

-- RLS Policies for public comment attachments
CREATE POLICY "Public can read attachments for approved comments"
  ON public_comment_attachments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public_comment_submissions 
      WHERE id = comment_id AND status = 'approved'
    )
  );

CREATE POLICY "Agency members can read all attachments for their dockets"
  ON public_comment_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public_comment_submissions pcs
      JOIN dockets d ON d.id = pcs.docket_id
      JOIN agency_members am ON am.agency_id = d.agency_id
      WHERE pcs.id = comment_id AND am.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_comments_docket_id ON public_comment_submissions(docket_id);
CREATE INDEX IF NOT EXISTS idx_public_comments_status ON public_comment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_public_comments_tracking_id ON public_comment_submissions(tracking_id);
CREATE INDEX IF NOT EXISTS idx_public_attachments_comment_id ON public_comment_attachments(comment_id);

-- Function to submit public comment
CREATE OR REPLACE FUNCTION submit_public_comment(
  p_docket_slug text,
  p_commenter_name text DEFAULT NULL,
  p_commenter_email text DEFAULT NULL,
  p_commenter_organization text DEFAULT NULL,
  p_content text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_docket_id uuid;
  v_comment_id uuid;
  v_tracking_id text;
  v_auto_publish boolean;
BEGIN
  -- Get docket info
  SELECT id, auto_publish INTO v_docket_id, v_auto_publish
  FROM dockets 
  WHERE slug = p_docket_slug 
    AND status = 'open' 
    AND (close_at IS NULL OR close_at > now());
  
  IF v_docket_id IS NULL THEN
    RAISE EXCEPTION 'Docket not found or comment period closed';
  END IF;
  
  -- Insert comment
  INSERT INTO public_comment_submissions (
    docket_id,
    commenter_name,
    commenter_email,
    commenter_organization,
    content,
    status,
    ip_address,
    user_agent
  ) VALUES (
    v_docket_id,
    p_commenter_name,
    p_commenter_email,
    p_commenter_organization,
    p_content,
    CASE WHEN v_auto_publish THEN 'approved'::comment_status ELSE 'pending'::comment_status END,
    p_ip_address,
    p_user_agent
  ) RETURNING id, tracking_id INTO v_comment_id, v_tracking_id;
  
  RETURN json_build_object(
    'comment_id', v_comment_id,
    'tracking_id', v_tracking_id,
    'status', CASE WHEN v_auto_publish THEN 'approved' ELSE 'pending' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public dockets
CREATE OR REPLACE FUNCTION get_public_dockets(
  p_search_query text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_status text DEFAULT 'open',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
) RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  slug text,
  tags text[],
  status text,
  open_at timestamptz,
  close_at timestamptz,
  comment_count bigint,
  agency_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.summary,
    d.slug,
    d.tags,
    d.status,
    d.open_at,
    d.close_at,
    COUNT(pcs.id) as comment_count,
    a.name as agency_name
  FROM dockets d
  JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN public_comment_submissions pcs ON pcs.docket_id = d.id AND pcs.status = 'approved'
  WHERE 
    (p_status IS NULL OR d.status = p_status)
    AND (p_search_query IS NULL OR d.search_vector @@ plainto_tsquery('english', p_search_query))
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND d.status != 'archived'
  GROUP BY d.id, a.name
  ORDER BY 
    CASE WHEN p_search_query IS NOT NULL THEN ts_rank(d.search_vector, plainto_tsquery('english', p_search_query)) END DESC,
    d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing comments table to work with new public system
DO $$
BEGIN
  -- Add tracking_id to existing comments table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'tracking_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN tracking_id text UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex');
    CREATE INDEX IF NOT EXISTS idx_comments_tracking_id ON comments(tracking_id);
  END IF;
END $$;
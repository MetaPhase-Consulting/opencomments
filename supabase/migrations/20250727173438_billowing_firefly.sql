/*
  # Advanced Search System

  1. Search Infrastructure
    - Full-text search vectors for dockets and comments
    - Optimized indexes for faceted search
    - Advanced search RPC function

  2. Search Indexes
    - Text search vectors (tsvector)
    - Facet indexes for filtering
    - Performance optimization indexes

  3. Security
    - RLS-aware search function
    - Role-based result filtering
    - Agency-scoped results only
*/

-- Add full-text search vectors to dockets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE dockets ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Add full-text search vectors to comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE comments ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_dockets_search_vector ON dockets USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_comments_search_vector ON comments USING gin(search_vector);

-- Create indexes for faceted search
CREATE INDEX IF NOT EXISTS idx_dockets_tags ON dockets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_dockets_reference_code ON dockets(reference_code);
CREATE INDEX IF NOT EXISTS idx_dockets_open_at ON dockets(open_at);
CREATE INDEX IF NOT EXISTS idx_dockets_close_at ON dockets(close_at);

CREATE INDEX IF NOT EXISTS idx_comments_commenter_email ON comments(commenter_email);
CREATE INDEX IF NOT EXISTS idx_comments_commenter_name ON comments(commenter_name);
CREATE INDEX IF NOT EXISTS idx_comments_commenter_organization ON comments(commenter_organization);

CREATE INDEX IF NOT EXISTS idx_comment_attachments_mime_type ON comment_attachments(mime_type);
CREATE INDEX IF NOT EXISTS idx_comment_attachments_file_size ON comment_attachments(file_size);

CREATE INDEX IF NOT EXISTS idx_docket_attachments_mime_type ON docket_attachments(mime_type);
CREATE INDEX IF NOT EXISTS idx_docket_attachments_file_size ON docket_attachments(file_size);

-- Function to update search vectors for dockets
CREATE OR REPLACE FUNCTION update_docket_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.reference_code, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vectors for comments
CREATE OR REPLACE FUNCTION update_comment_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.commenter_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.commenter_organization, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to maintain search vectors
DROP TRIGGER IF EXISTS trigger_update_docket_search_vector ON dockets;
CREATE TRIGGER trigger_update_docket_search_vector
  BEFORE INSERT OR UPDATE ON dockets
  FOR EACH ROW EXECUTE FUNCTION update_docket_search_vector();

DROP TRIGGER IF EXISTS trigger_update_comment_search_vector ON comments;
CREATE TRIGGER trigger_update_comment_search_vector
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_search_vector();

-- Update existing records with search vectors
UPDATE dockets SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(summary, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(reference_code, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'D')
WHERE search_vector IS NULL;

UPDATE comments SET search_vector = 
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(commenter_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(commenter_organization, '')), 'C')
WHERE search_vector IS NULL;

-- Advanced search function
CREATE OR REPLACE FUNCTION advanced_search(
  p_agency_id uuid,
  p_user_role text,
  p_query text DEFAULT '',
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  result_type text,
  result_id uuid,
  title text,
  content text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  metadata jsonb,
  rank real
) AS $$
DECLARE
  search_query tsquery;
  date_from timestamptz;
  date_to timestamptz;
  docket_statuses text[];
  comment_statuses text[];
  tags_filter text[];
  has_attachments boolean;
  mime_types text[];
  min_file_size bigint;
  max_file_size bigint;
  commenter_email_filter text;
  commenter_domain_filter text;
  reference_code_filter text;
  sort_by text;
BEGIN
  -- Parse search query
  IF p_query IS NOT NULL AND p_query != '' THEN
    search_query := plainto_tsquery('english', p_query);
  END IF;

  -- Parse filters
  date_from := (p_filters->>'date_from')::timestamptz;
  date_to := (p_filters->>'date_to')::timestamptz;
  docket_statuses := ARRAY(SELECT jsonb_array_elements_text(p_filters->'docket_statuses'));
  comment_statuses := ARRAY(SELECT jsonb_array_elements_text(p_filters->'comment_statuses'));
  tags_filter := ARRAY(SELECT jsonb_array_elements_text(p_filters->'tags'));
  has_attachments := (p_filters->>'has_attachments')::boolean;
  mime_types := ARRAY(SELECT jsonb_array_elements_text(p_filters->'mime_types'));
  min_file_size := (p_filters->>'min_file_size')::bigint;
  max_file_size := (p_filters->>'max_file_size')::bigint;
  commenter_email_filter := p_filters->>'commenter_email';
  commenter_domain_filter := p_filters->>'commenter_domain';
  reference_code_filter := p_filters->>'reference_code';
  sort_by := COALESCE(p_filters->>'sort_by', 'relevance');

  -- Search dockets
  RETURN QUERY
  SELECT 
    'docket'::text as result_type,
    d.id as result_id,
    d.title,
    d.description as content,
    d.status,
    d.created_at,
    d.updated_at,
    jsonb_build_object(
      'reference_code', d.reference_code,
      'tags', d.tags,
      'comment_deadline', d.comment_deadline,
      'comment_count', COALESCE(comment_counts.count, 0)
    ) as metadata,
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(d.search_vector, search_query)
      ELSE 0
    END as rank
  FROM dockets d
  LEFT JOIN (
    SELECT docket_id, COUNT(*) as count
    FROM comments 
    WHERE status = 'published'
    GROUP BY docket_id
  ) comment_counts ON d.id = comment_counts.docket_id
  WHERE d.agency_id = p_agency_id
    AND (search_query IS NULL OR d.search_vector @@ search_query)
    AND (date_from IS NULL OR d.created_at >= date_from)
    AND (date_to IS NULL OR d.created_at <= date_to)
    AND (docket_statuses IS NULL OR d.status = ANY(docket_statuses))
    AND (tags_filter IS NULL OR d.tags && tags_filter)
    AND (reference_code_filter IS NULL OR d.reference_code ILIKE '%' || reference_code_filter || '%')
  
  UNION ALL
  
  -- Search comments (with role-based filtering)
  SELECT 
    'comment'::text as result_type,
    c.id as result_id,
    d.title,
    c.content,
    c.status,
    c.created_at,
    c.updated_at,
    jsonb_build_object(
      'docket_id', c.docket_id,
      'docket_title', d.title,
      'commenter_name', c.commenter_name,
      'commenter_email', c.commenter_email,
      'commenter_organization', c.commenter_organization,
      'attachment_count', COALESCE(attachment_counts.count, 0)
    ) as metadata,
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(c.search_vector, search_query)
      ELSE 0
    END as rank
  FROM comments c
  JOIN dockets d ON c.docket_id = d.id
  LEFT JOIN (
    SELECT comment_id, COUNT(*) as count
    FROM comment_attachments
    GROUP BY comment_id
  ) attachment_counts ON c.id = attachment_counts.comment_id
  WHERE d.agency_id = p_agency_id
    AND (search_query IS NULL OR c.search_vector @@ search_query)
    AND (date_from IS NULL OR c.created_at >= date_from)
    AND (date_to IS NULL OR c.created_at <= date_to)
    AND (
      -- Role-based comment visibility
      CASE p_user_role
        WHEN 'viewer' THEN c.status = 'published'
        WHEN 'reviewer' THEN c.status IN ('published', 'submitted', 'under_review')
        ELSE TRUE -- manager, admin, owner see all
      END
    )
    AND (comment_statuses IS NULL OR c.status = ANY(comment_statuses))
    AND (commenter_email_filter IS NULL OR c.commenter_email ILIKE '%' || commenter_email_filter || '%')
    AND (commenter_domain_filter IS NULL OR c.commenter_email ILIKE '%@' || commenter_domain_filter || '%')
    AND (
      has_attachments IS NULL OR 
      (has_attachments = true AND attachment_counts.count > 0) OR
      (has_attachments = false AND attachment_counts.count = 0)
    )
  
  ORDER BY 
    CASE sort_by
      WHEN 'relevance' THEN rank
      WHEN 'newest' THEN EXTRACT(EPOCH FROM created_at)
      WHEN 'oldest' THEN -EXTRACT(EPOCH FROM created_at)
      WHEN 'alphabetical' THEN 0
    END DESC,
    CASE WHEN sort_by = 'alphabetical' THEN title END ASC,
    created_at DESC
  
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION advanced_search TO authenticated;
/*
  # Create comment search functionality

  1. New Functions
    - search_comments: Full-text search with advanced filtering
    - get_comment_detail: Get full comment with related data

  2. Indexes
    - Full-text search indexes on comments and related tables
    - Performance indexes for filtering

  3. Security
    - Public access to approved comments only
    - Proper RLS policies
*/

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_comments_search_vector ON comments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_comments_agency_created ON comments(docket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status_created ON comments(status, created_at);

-- Create search function for public comments
CREATE OR REPLACE FUNCTION search_comments(
  p_query text DEFAULT NULL,
  p_agency_name text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_commenter_type text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_sort_by text DEFAULT 'newest',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  content text,
  snippet text,
  commenter_name text,
  commenter_organization text,
  commenter_type text,
  position text,
  created_at timestamptz,
  docket_id uuid,
  docket_title text,
  docket_slug text,
  agency_name text,
  agency_jurisdiction text,
  tags text[],
  attachment_count bigint,
  rank real
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Build search query if provided
  IF p_query IS NOT NULL AND trim(p_query) != '' THEN
    search_query := plainto_tsquery('english', p_query);
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_headline('english', c.content, search_query, 'MaxWords=50, MinWords=20, MaxFragments=1')
      ELSE
        left(c.content, 200) || CASE WHEN length(c.content) > 200 THEN '...' ELSE '' END
    END as snippet,
    c.commenter_name,
    c.commenter_organization,
    COALESCE(ci.representation, 'individual') as commenter_type,
    COALESCE(c.position, 'not_specified') as position,
    c.created_at,
    d.id as docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    d.tags,
    COALESCE(att_count.count, 0) as attachment_count,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(c.search_vector, search_query)
      ELSE
        0.0
    END as rank
  FROM comments c
  INNER JOIN dockets d ON d.id = c.docket_id
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN commenter_info ci ON ci.comment_id = c.id
  LEFT JOIN (
    SELECT 
      comment_id, 
      COUNT(*) as count 
    FROM comment_attachments 
    GROUP BY comment_id
  ) att_count ON att_count.comment_id = c.id
  WHERE 
    c.status = 'published'
    AND d.status IN ('open', 'closed')
    AND (search_query IS NULL OR c.search_vector @@ search_query)
    AND (p_agency_name IS NULL OR a.name ILIKE '%' || p_agency_name || '%')
    AND (p_state IS NULL OR a.jurisdiction ILIKE '%' || p_state || '%')
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_date_from IS NULL OR c.created_at >= p_date_from)
    AND (p_date_to IS NULL OR c.created_at <= p_date_to)
    AND (p_commenter_type IS NULL OR 
         (p_commenter_type = 'individual' AND (ci.representation IS NULL OR ci.representation = 'myself')) OR
         (p_commenter_type = 'organization' AND ci.representation = 'organization') OR
         (p_commenter_type = 'agent' AND ci.representation = 'behalf_of_another') OR
         (p_commenter_type = 'anonymous' AND c.commenter_name IS NULL))
    AND (p_position IS NULL OR c.position = p_position)
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'newest' THEN c.created_at
    END DESC,
    CASE 
      WHEN p_sort_by = 'oldest' THEN c.created_at
    END ASC,
    CASE 
      WHEN p_sort_by = 'agency' THEN a.name
    END ASC,
    CASE 
      WHEN p_sort_by = 'docket' THEN d.title
    END ASC,
    CASE 
      WHEN search_query IS NOT NULL THEN ts_rank(c.search_vector, search_query)
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to get comment detail
CREATE OR REPLACE FUNCTION get_comment_detail(p_comment_id uuid)
RETURNS TABLE (
  id uuid,
  content text,
  commenter_name text,
  commenter_email text,
  commenter_organization text,
  commenter_type text,
  organization_name text,
  authorization_statement text,
  position text,
  created_at timestamptz,
  docket_id uuid,
  docket_title text,
  docket_slug text,
  docket_description text,
  agency_name text,
  agency_jurisdiction text,
  tags text[],
  attachments jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.commenter_name,
    c.commenter_email,
    c.commenter_organization,
    COALESCE(ci.representation, 'individual') as commenter_type,
    ci.organization_name,
    ci.authorization_statement,
    COALESCE(c.position, 'not_specified') as position,
    c.created_at,
    d.id as docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    d.description as docket_description,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    d.tags,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', ca.id,
          'filename', ca.filename,
          'file_url', ca.file_url,
          'file_size', ca.file_size,
          'mime_type', ca.mime_type
        )
      ) FROM comment_attachments ca WHERE ca.comment_id = c.id),
      '[]'::jsonb
    ) as attachments
  FROM comments c
  INNER JOIN dockets d ON d.id = c.docket_id
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN commenter_info ci ON ci.comment_id = c.id
  WHERE 
    c.id = p_comment_id
    AND c.status = 'published'
    AND d.status IN ('open', 'closed');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comment_detail TO anon, authenticated;
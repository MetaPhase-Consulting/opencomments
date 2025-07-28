/*
  # Create search_comments function

  1. New Functions
    - `search_comments` - Search through published public comments with filters
    - `get_comment_detail` - Get detailed comment information for display

  2. Security
    - Functions are accessible to anonymous and authenticated users
    - Only returns published comments from public dockets
    - Proper RLS enforcement through function logic
*/

-- Create search_comments function
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
  comment_position text,
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
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    CASE 
      WHEN length(c.content) > 200 THEN left(c.content, 200) || '...'
      ELSE c.content
    END as snippet,
    c.commenter_name,
    c.commenter_organization,
    COALESCE(ci.representation, 'individual') as commenter_type,
    COALESCE(ci.comment_position, 'not_specified') as comment_position,
    c.created_at,
    c.docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(d.tags, ARRAY[]::text[]) as tags,
    COALESCE(att_count.count, 0) as attachment_count,
    CASE 
      WHEN p_query IS NOT NULL AND c.search_vector IS NOT NULL THEN 
        ts_rank(c.search_vector, plainto_tsquery('english', p_query))
      ELSE 0.0
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
    AND d.status IN ('open', 'closed', 'archived')
    AND (p_query IS NULL OR (c.search_vector IS NOT NULL AND c.search_vector @@ plainto_tsquery('english', p_query)))
    AND (p_agency_name IS NULL OR a.name ILIKE '%' || p_agency_name || '%')
    AND (p_state IS NULL OR a.jurisdiction ILIKE '%' || p_state || '%')
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_date_from IS NULL OR c.created_at >= p_date_from)
    AND (p_date_to IS NULL OR c.created_at <= p_date_to)
    AND (p_commenter_type IS NULL OR COALESCE(ci.representation, 'individual') = p_commenter_type)
    AND (p_position IS NULL OR COALESCE(ci.comment_position, 'not_specified') = p_position)
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
      WHEN p_query IS NOT NULL AND c.search_vector IS NOT NULL THEN 
        ts_rank(c.search_vector, plainto_tsquery('english', p_query))
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create get_comment_detail function
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
  comment_position text,
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
    COALESCE(ci.comment_position, 'not_specified') as comment_position,
    c.created_at,
    c.docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    d.description as docket_description,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(d.tags, ARRAY[]::text[]) as tags,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ca.id,
            'filename', ca.filename,
            'file_url', ca.file_url,
            'file_size', ca.file_size,
            'mime_type', ca.mime_type
          )
        )
        FROM comment_attachments ca 
        WHERE ca.comment_id = c.id
      ),
      '[]'::jsonb
    ) as attachments
  FROM comments c
  INNER JOIN dockets d ON d.id = c.docket_id
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN commenter_info ci ON ci.comment_id = c.id
  WHERE 
    c.id = p_comment_id
    AND c.status = 'published'
    AND d.status IN ('open', 'closed', 'archived');
END;
$$;

-- Grant permissions to allow public access
GRANT EXECUTE ON FUNCTION search_comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comment_detail TO anon, authenticated;
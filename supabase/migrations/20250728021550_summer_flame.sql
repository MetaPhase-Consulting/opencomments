/*
  # Fix search_comments function column reference

  1. Changes
     - Fix column reference from ci.comment_position to c.position
     - Ensure proper table aliases are used throughout the function

  2. Security
     - Maintains existing RLS and security policies
     - Only returns published comments from open dockets
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS search_comments(
  p_query text,
  p_agency_name text,
  p_state text,
  p_tags text[],
  p_date_from timestamptz,
  p_date_to timestamptz,
  p_commenter_type text,
  p_position text,
  p_sort_by text,
  p_limit integer,
  p_offset integer
);

-- Recreate the function with correct column references
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
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.body, c.content) as content,
    CASE 
      WHEN p_query IS NOT NULL AND p_query != '' THEN
        ts_headline('english', COALESCE(c.body, c.content), plainto_tsquery('english', p_query))
      ELSE
        LEFT(COALESCE(c.body, c.content), 200) || CASE WHEN LENGTH(COALESCE(c.body, c.content)) > 200 THEN '...' ELSE '' END
    END as snippet,
    COALESCE(c.submitter_name, c.commenter_name) as commenter_name,
    COALESCE(c.organization, c.commenter_organization) as commenter_organization,
    CASE 
      WHEN c.organization IS NOT NULL AND c.organization != '' THEN 'organization'
      WHEN c.commenter_organization IS NOT NULL AND c.commenter_organization != '' THEN 'organization'
      WHEN COALESCE(c.submitter_name, c.commenter_name) IS NOT NULL THEN 'individual'
      ELSE 'anonymous'
    END as commenter_type,
    COALESCE(c.position, 'not_specified') as position,
    c.created_at,
    d.id as docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(d.tags, ARRAY[]::text[]) as tags,
    COALESCE(att_count.count, 0) as attachment_count,
    CASE 
      WHEN p_query IS NOT NULL AND p_query != '' THEN
        ts_rank(c.search_vector, plainto_tsquery('english', p_query))
      ELSE 
        0.0
    END as rank
  FROM comments c
  INNER JOIN dockets d ON d.id = c.docket_id
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN (
    SELECT 
      comment_id,
      COUNT(*) as count
    FROM attachments
    GROUP BY comment_id
  ) att_count ON att_count.comment_id = c.id
  WHERE 
    c.status = 'published'
    AND d.status = 'open'
    AND (
      p_query IS NULL 
      OR p_query = '' 
      OR c.search_vector @@ plainto_tsquery('english', p_query)
      OR d.search_vector @@ plainto_tsquery('english', p_query)
    )
    AND (
      p_agency_name IS NULL 
      OR p_agency_name = ''
      OR a.name ILIKE '%' || p_agency_name || '%'
    )
    AND (
      p_state IS NULL 
      OR p_state = ''
      OR a.jurisdiction ILIKE '%' || p_state || '%'
    )
    AND (
      p_tags IS NULL 
      OR array_length(p_tags, 1) IS NULL
      OR d.tags && p_tags
    )
    AND (
      p_date_from IS NULL 
      OR c.created_at >= p_date_from
    )
    AND (
      p_date_to IS NULL 
      OR c.created_at <= p_date_to + interval '1 day'
    )
    AND (
      p_commenter_type IS NULL 
      OR p_commenter_type = ''
      OR (
        p_commenter_type = 'individual' AND c.organization IS NULL AND c.commenter_organization IS NULL
      )
      OR (
        p_commenter_type = 'organization' AND (c.organization IS NOT NULL OR c.commenter_organization IS NOT NULL)
      )
      OR (
        p_commenter_type = 'anonymous' AND COALESCE(c.submitter_name, c.commenter_name) IS NULL
      )
    )
    AND (
      p_position IS NULL 
      OR p_position = ''
      OR p_position = 'not_specified'
      OR c.position = p_position
    )
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
      WHEN p_query IS NOT NULL AND p_query != '' THEN ts_rank(c.search_vector, plainto_tsquery('english', p_query))
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
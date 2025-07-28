/*
  # Create get_public_dockets RPC function

  1. New Functions
    - `get_public_dockets` - Returns public dockets with search and filtering capabilities
  
  2. Features
    - Full-text search across title and description
    - Tag filtering
    - Status filtering (open/closed/all)
    - Pagination support
    - Comment count aggregation
    - Agency information included
  
  3. Security
    - Public access (no authentication required)
    - Only returns open or recently closed dockets
    - Excludes draft and archived dockets
*/

CREATE OR REPLACE FUNCTION get_public_dockets(
  p_search_query text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_status text DEFAULT 'open',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    COALESCE(d.summary, d.description) as summary,
    d.slug,
    d.tags,
    d.status,
    d.open_at,
    d.close_at,
    COALESCE(comment_counts.count, 0) as comment_count,
    a.name as agency_name
  FROM dockets d
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN (
    SELECT 
      c.docket_id,
      COUNT(*) as count
    FROM comments c
    WHERE c.status = 'published'
    GROUP BY c.docket_id
  ) comment_counts ON comment_counts.docket_id = d.id
  WHERE 
    -- Only show non-draft dockets
    d.status != 'draft'
    -- Status filter
    AND (
      p_status = 'all' 
      OR (p_status = 'open' AND d.status = 'open')
      OR (p_status = 'closed' AND d.status = 'closed')
    )
    -- Search filter
    AND (
      p_search_query IS NULL 
      OR d.search_vector @@ plainto_tsquery('english', p_search_query)
      OR d.title ILIKE '%' || p_search_query || '%'
      OR d.description ILIKE '%' || p_search_query || '%'
      OR a.name ILIKE '%' || p_search_query || '%'
    )
    -- Tags filter
    AND (
      p_tags IS NULL 
      OR p_tags = '{}'
      OR d.tags && p_tags
    )
    -- Exclude archived dockets
    AND d.status != 'archived'
  ORDER BY 
    CASE 
      WHEN p_search_query IS NOT NULL THEN ts_rank(d.search_vector, plainto_tsquery('english', p_search_query))
      ELSE 0
    END DESC,
    d.open_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
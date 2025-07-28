-- 2025-07-29 10:00:02 Add Missing Functions

-- Add the missing browse_public_dockets function
CREATE OR REPLACE FUNCTION browse_public_dockets(
  p_query text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_status text DEFAULT 'open',
  p_tags text[] DEFAULT NULL,
  p_sort_by text DEFAULT 'newest',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  summary text,
  agency_name text,
  agency_jurisdiction text,
  status text,
  comment_count bigint,
  open_at timestamptz,
  close_at timestamptz,
  tags text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.slug,
    d.summary,
    a.name,
    a.jurisdiction,
    d.status::text,
    (SELECT COUNT(*) FROM comments c WHERE c.docket_id = d.id AND c.status = 'approved'),
    d.open_at,
    d.close_at,
    d.tags
  FROM
    dockets d
  JOIN
    agencies a ON d.agency_id = a.id
  WHERE
    (p_status IS NULL OR d.status::text = p_status)
    AND (p_state IS NULL OR a.jurisdiction ILIKE p_state)
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_query IS NULL OR d.search_vector @@ plainto_tsquery('english', p_query))
  ORDER BY
    CASE WHEN p_sort_by = 'newest' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'oldest' THEN d.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION browse_public_dockets TO anon, authenticated; 
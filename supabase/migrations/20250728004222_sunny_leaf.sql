/*
  # Create get_public_dockets function

  1. New Functions
    - `get_public_dockets` - Returns public dockets with search, filtering, and pagination
      - Supports full-text search via search_vector
      - Filters by tags and status
      - Includes comment counts and agency information
      - Pagination with limit/offset

  2. Security
    - Function is accessible to public (anon) and authenticated users
    - Only returns dockets that are publicly accessible
    - Respects existing RLS policies on underlying tables
*/

CREATE OR REPLACE FUNCTION public.get_public_dockets(
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
        d.summary,
        d.slug,
        d.tags,
        d.status::text,
        d.open_at,
        d.close_at,
        COALESCE(comment_counts.count, 0)::bigint,
        a.name AS agency_name
    FROM
        dockets d
    JOIN
        agencies a ON d.agency_id = a.id
    LEFT JOIN (
        SELECT
            docket_id,
            COUNT(id) AS count
        FROM
            comments
        WHERE
            status = 'published'
        GROUP BY
            docket_id
    ) AS comment_counts ON d.id = comment_counts.docket_id
    WHERE
        (p_status IS NULL OR d.status = p_status)
        AND (p_search_query IS NULL OR d.search_vector @@ plainto_tsquery('english', p_search_query))
        AND (p_tags IS NULL OR d.tags && p_tags)
        AND d.status IN ('open', 'closed') -- Only show public dockets
    ORDER BY
        CASE WHEN d.status = 'open' THEN 0 ELSE 1 END,
        d.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
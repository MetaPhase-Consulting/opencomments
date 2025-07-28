-- 2025-07-29 10:00:12 Fix Function Conflict

-- Drop all versions of the search_comments function
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text, text, text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text, text, text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS search_comments() CASCADE;
DROP FUNCTION IF EXISTS search_comments(text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[]) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, text, text, text, text, text, text, integer) CASCADE;

-- Drop all versions of the browse_public_dockets function
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz, timestamptz, text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets() CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[]) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz, timestamptz) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz, timestamptz, text) CASCADE;
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz, timestamptz, text, integer) CASCADE;

-- Recreate search_comments function with total count
CREATE OR REPLACE FUNCTION search_comments(
  p_query           text DEFAULT NULL,
  p_agency_name     text DEFAULT NULL,
  p_state           text DEFAULT NULL,
  p_tags            text[] DEFAULT NULL,
  p_date_from       timestamptz DEFAULT NULL,
  p_date_to         timestamptz DEFAULT NULL,
  p_commenter_type  text DEFAULT NULL,
  p_position        text DEFAULT NULL,
  p_comment_filter  text DEFAULT NULL,
  p_filing_company  text DEFAULT NULL,
  p_comment_id      text DEFAULT NULL,
  p_docket_id       text DEFAULT NULL,
  p_sort_by         text DEFAULT 'newest',
  p_limit           integer DEFAULT 10,
  p_offset          integer DEFAULT 0
)
RETURNS TABLE (
  id                     uuid,
  content                text,
  snippet                text,
  commenter_name         text,
  commenter_organization text,
  commenter_type         text,
  comment_position       text,
  created_at             timestamptz,
  docket_id              uuid,
  docket_title           text,
  docket_slug            text,
  agency_name            text,
  agency_jurisdiction    text,
  tags                   text[],
  attachment_count       bigint,
  rank                   real,
  total_count            bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ts_query tsquery := CASE WHEN p_query IS NOT NULL AND trim(p_query) <> ''
                           THEN plainto_tsquery('english', p_query)
                           ELSE NULL END;
  wildcard_query text := CASE WHEN p_query IS NOT NULL AND trim(p_query) <> ''
                              THEN '%' || p_query || '%'
                              ELSE NULL END;
BEGIN
  RETURN QUERY
  WITH filtered_comments AS (
    SELECT c.id
    FROM   comments        c
    JOIN   dockets         d  ON d.id = c.docket_id
    JOIN   agencies        a  ON a.id = d.agency_id
    LEFT   JOIN commenter_info ci ON ci.comment_id = c.id
    WHERE  c.status = 'approved'
      AND  d.status IN ('open','closed')
      AND  (
        p_query IS NULL 
        OR (
          -- Full-text search for smart features (fuzzy matching, relevance)
          (ts_query IS NOT NULL AND c.search_vector @@ ts_query)
          OR
          -- Partial word matching for immediate results (AND logic)
          (
            SELECT bool_and(
              c.content ILIKE '%' || word || '%' OR
              c.commenter_name ILIKE '%' || word || '%' OR
              c.commenter_organization ILIKE '%' || word || '%' OR
              d.title ILIKE '%' || word || '%' OR
              d.summary ILIKE '%' || word || '%' OR
              a.name ILIKE '%' || word || '%'
            )
            FROM unnest(string_to_array(p_query, ' ')) AS word
            WHERE word != ''
          )
        )
      )
      AND  (p_agency_name IS NULL OR a.name ILIKE '%'||p_agency_name||'%')
      AND  (p_state IS NULL OR a.jurisdiction ILIKE '%'||p_state||'%')
      AND  (p_tags IS NULL OR d.tags && p_tags)
      AND  (p_date_from IS NULL OR c.created_at >= p_date_from)
      AND  (p_date_to   IS NULL OR c.created_at <= p_date_to)
      AND  (p_commenter_type IS NULL OR COALESCE(ci.representation,'individual') = p_commenter_type)
      AND  (p_position IS NULL OR COALESCE(c.comment_position,'not_specified') = p_position)
      AND  (p_comment_filter IS NULL OR c.commenter_name ILIKE '%'||p_comment_filter||'%')
      AND  (p_filing_company IS NULL OR c.commenter_organization ILIKE '%'||p_filing_company||'%')
      AND  (p_comment_id IS NULL OR c.id::text = p_comment_id)
      AND  (p_docket_id IS NULL OR d.id::text = p_docket_id)
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM filtered_comments
  )
  SELECT
    c.id,
    c.content,
    LEFT(c.content,200) || CASE WHEN length(c.content) > 200 THEN '...' ELSE '' END AS snippet,
    c.commenter_name,
    c.commenter_organization,
    COALESCE(ci.representation,'individual')        AS commenter_type,
    COALESCE(c.comment_position,'not_specified')    AS comment_position,
    c.created_at,
    d.id                                            AS docket_id,
    d.title,
    d.slug,
    a.name                                          AS agency_name,
    a.jurisdiction                                  AS agency_jurisdiction,
    COALESCE(d.tags,ARRAY[]::text[])                AS tags,
    (SELECT COUNT(*) FROM attachments att WHERE att.comment_id = c.id) AS attachment_count,
    CASE WHEN ts_query IS NOT NULL THEN ts_rank(c.search_vector, ts_query) ELSE 0 END AS rank,
    tc.total                                        AS total_count
  FROM   comments        c
  JOIN   dockets         d  ON d.id = c.docket_id
  JOIN   agencies        a  ON a.id = d.agency_id
  LEFT   JOIN commenter_info ci ON ci.comment_id = c.id
  JOIN   filtered_comments fc ON fc.id = c.id
  CROSS  JOIN total_count tc
  ORDER  BY
    CASE WHEN p_sort_by = 'newest' THEN c.created_at END DESC,
    CASE WHEN p_sort_by = 'oldest' THEN c.created_at END ASC,
    CASE WHEN p_sort_by = 'agency' THEN a.name END ASC,
    CASE WHEN p_sort_by = 'docket' THEN d.title END ASC,
    rank DESC
  LIMIT  p_limit OFFSET p_offset;
END;
$$;

-- Recreate browse_public_dockets function with total count
CREATE OR REPLACE FUNCTION browse_public_dockets(
  p_query text DEFAULT NULL,
  p_agency_name text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_status text DEFAULT 'open',
  p_tags text[] DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_sort_by text DEFAULT 'newest',
  p_limit integer DEFAULT 10,
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
  tags text[],
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ts_query tsquery := CASE WHEN p_query IS NOT NULL AND trim(p_query) <> ''
                           THEN plainto_tsquery('english', p_query)
                           ELSE NULL END;
  wildcard_query text := CASE WHEN p_query IS NOT NULL AND trim(p_query) <> ''
                              THEN '%' || p_query || '%'
                              ELSE NULL END;
BEGIN
  RETURN QUERY
  WITH filtered_dockets AS (
    SELECT d.id
    FROM
      dockets d
    JOIN
      agencies a ON d.agency_id = a.id
    WHERE
      (p_status IS NULL OR d.status::text = p_status)
      AND (p_agency_name IS NULL OR a.name ILIKE ('%' || p_agency_name || '%'))
      AND (p_state IS NULL OR a.jurisdiction ILIKE p_state)
      AND (p_tags IS NULL OR d.tags && p_tags)
      AND (p_date_from IS NULL OR d.created_at >= p_date_from)
      AND (p_date_to IS NULL OR d.created_at <= p_date_to)
      AND (
        p_query IS NULL 
        OR (
          -- Full-text search for smart features (fuzzy matching, relevance)
          (ts_query IS NOT NULL AND d.search_vector @@ ts_query)
          OR
          -- Partial word matching for immediate results (AND logic)
          (
            SELECT bool_and(
              d.title ILIKE '%' || word || '%' OR
              d.summary ILIKE '%' || word || '%' OR
              d.description ILIKE '%' || word || '%' OR
              a.name ILIKE '%' || word || '%' OR
              a.jurisdiction ILIKE '%' || word || '%'
            )
            FROM unnest(string_to_array(p_query, ' ')) AS word
            WHERE word != ''
          )
        )
      )
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM filtered_dockets
  )
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
    d.tags,
    tc.total
  FROM
    dockets d
  JOIN
    agencies a ON d.agency_id = a.id
  JOIN
    filtered_dockets fd ON fd.id = d.id
  CROSS
    JOIN total_count tc
  ORDER BY
    CASE WHEN p_sort_by = 'newest' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'oldest' THEN d.created_at END ASC,
    CASE WHEN p_sort_by = 'title_asc' THEN d.title END ASC,
    CASE WHEN p_sort_by = 'title_desc' THEN d.title END DESC,
    CASE WHEN p_sort_by = 'agency_asc' THEN a.name END ASC,
    CASE WHEN p_sort_by = 'agency_desc' THEN a.name END DESC,
    CASE WHEN p_sort_by = 'closing_soon' THEN d.close_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION search_comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION browse_public_dockets TO anon, authenticated; 
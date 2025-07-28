/*
  # Public Browse Functions

  1. New Functions
    - `browse_public_dockets`: Search and filter public dockets
    - `get_agency_public_profile`: Get agency info and dockets
    - `get_docket_public_detail`: Get docket with comments
  
  2. Security
    - Functions accessible to anonymous users
    - Only return published/open content
  
  3. Performance
    - Proper indexing for search and filtering
    - Efficient pagination
*/

-- Create function to browse public dockets
CREATE OR REPLACE FUNCTION browse_public_dockets(
  p_query text DEFAULT NULL,
  p_agency_name text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_sort_by text DEFAULT 'newest',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  slug text,
  status text,
  open_at timestamptz,
  close_at timestamptz,
  tags text[],
  agency_id uuid,
  agency_name text,
  agency_slug text,
  agency_jurisdiction text,
  comment_count bigint,
  created_at timestamptz,
  rank real
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
    d.status,
    d.open_at,
    d.close_at,
    COALESCE(d.tags, ARRAY[]::text[]) as tags,
    d.agency_id,
    a.name as agency_name,
    LOWER(REGEXP_REPLACE(a.name, '[^a-zA-Z0-9\s]', '', 'g')) as agency_slug,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(comment_counts.count, 0) as comment_count,
    d.created_at,
    CASE 
      WHEN p_query IS NOT NULL THEN 
        ts_rank(d.search_vector, plainto_tsquery('english', p_query))
      ELSE 0.0
    END as rank
  FROM dockets d
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN (
    SELECT 
      docket_id, 
      COUNT(*) as count 
    FROM comments 
    WHERE status = 'published'
    GROUP BY docket_id
  ) comment_counts ON comment_counts.docket_id = d.id
  WHERE 
    d.status IN ('open', 'closed', 'archived')
    AND (p_query IS NULL OR d.search_vector @@ plainto_tsquery('english', p_query))
    AND (p_agency_name IS NULL OR a.name ILIKE '%' || p_agency_name || '%')
    AND (p_state IS NULL OR a.jurisdiction ILIKE '%' || p_state || '%')
    AND (p_status IS NULL OR d.status = p_status)
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_date_from IS NULL OR d.open_at >= p_date_from)
    AND (p_date_to IS NULL OR d.close_at <= p_date_to)
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'newest' THEN d.open_at
    END DESC,
    CASE 
      WHEN p_sort_by = 'closing' THEN d.close_at
    END ASC,
    CASE 
      WHEN p_sort_by = 'title' THEN d.title
    END ASC,
    CASE 
      WHEN p_sort_by = 'agency' THEN a.name
    END ASC,
    CASE 
      WHEN p_query IS NOT NULL THEN ts_rank(d.search_vector, plainto_tsquery('english', p_query))
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to get agency public profile
CREATE OR REPLACE FUNCTION get_agency_public_profile(p_agency_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  jurisdiction text,
  description text,
  logo_url text,
  contact_email text,
  created_at timestamptz,
  dockets jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.jurisdiction,
    a.description,
    a.logo_url,
    CASE 
      WHEN a.settings->>'public_contact_email' IS NOT NULL 
      THEN a.settings->>'public_contact_email'
      ELSE NULL
    END as contact_email,
    a.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', d.id,
            'title', d.title,
            'slug', d.slug,
            'status', d.status,
            'open_at', d.open_at,
            'close_at', d.close_at,
            'tags', COALESCE(d.tags, ARRAY[]::text[]),
            'comment_count', COALESCE(cc.count, 0),
            'created_at', d.created_at
          )
          ORDER BY d.open_at DESC
        )
        FROM dockets d
        LEFT JOIN (
          SELECT docket_id, COUNT(*) as count 
          FROM comments 
          WHERE status = 'published' 
          GROUP BY docket_id
        ) cc ON cc.docket_id = d.id
        WHERE d.agency_id = a.id 
        AND d.status IN ('open', 'closed', 'archived')
      ),
      '[]'::jsonb
    ) as dockets
  FROM agencies a
  WHERE LOWER(REGEXP_REPLACE(a.name, '[^a-zA-Z0-9\s]', '', 'g')) = LOWER(p_agency_slug)
  LIMIT 1;
END;
$$;

-- Create function to get docket public detail
CREATE OR REPLACE FUNCTION get_docket_public_detail(p_docket_slug text)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  summary text,
  slug text,
  status text,
  open_at timestamptz,
  close_at timestamptz,
  tags text[],
  agency_id uuid,
  agency_name text,
  agency_slug text,
  agency_jurisdiction text,
  comment_count bigint,
  created_at timestamptz,
  attachments jsonb,
  comments jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description,
    d.summary,
    d.slug,
    d.status,
    d.open_at,
    d.close_at,
    COALESCE(d.tags, ARRAY[]::text[]) as tags,
    d.agency_id,
    a.name as agency_name,
    LOWER(REGEXP_REPLACE(a.name, '[^a-zA-Z0-9\s]', '', 'g')) as agency_slug,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(comment_counts.count, 0) as comment_count,
    d.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', da.id,
            'filename', da.filename,
            'file_url', da.file_url,
            'file_size', da.file_size,
            'mime_type', da.mime_type
          )
        )
        FROM docket_attachments da 
        WHERE da.docket_id = d.id
      ),
      '[]'::jsonb
    ) as attachments,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'content', c.content,
            'commenter_name', c.commenter_name,
            'commenter_organization', c.commenter_organization,
            'created_at', c.created_at,
            'attachment_count', COALESCE(ca_count.count, 0)
          )
          ORDER BY c.created_at DESC
        )
        FROM comments c
        LEFT JOIN (
          SELECT comment_id, COUNT(*) as count 
          FROM comment_attachments 
          GROUP BY comment_id
        ) ca_count ON ca_count.comment_id = c.id
        WHERE c.docket_id = d.id 
        AND c.status = 'published'
      ),
      '[]'::jsonb
    ) as comments
  FROM dockets d
  INNER JOIN agencies a ON a.id = d.agency_id
  LEFT JOIN (
    SELECT 
      docket_id, 
      COUNT(*) as count 
    FROM comments 
    WHERE status = 'published'
    GROUP BY docket_id
  ) comment_counts ON comment_counts.docket_id = d.id
  WHERE 
    d.slug = p_docket_slug
    AND d.status IN ('open', 'closed', 'archived')
  LIMIT 1;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION browse_public_dockets TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_agency_public_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_docket_public_detail TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_name_search ON agencies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_dockets_slug ON dockets(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dockets_open_at ON dockets(open_at);
CREATE INDEX IF NOT EXISTS idx_dockets_close_at ON dockets(close_at);
CREATE INDEX IF NOT EXISTS idx_dockets_status_public ON dockets(status) WHERE status IN ('open', 'closed', 'archived');
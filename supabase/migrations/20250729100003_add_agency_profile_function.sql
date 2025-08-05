-- 2025-07-29 10:00:03 Add Agency Profile Function

-- Add the missing get_agency_public_profile function
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
    a.contact_email,
    a.created_at,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'title', d.title,
        'slug', d.slug,
        'status', d.status,
        'open_at', d.open_at,
        'close_at', d.close_at,
        'tags', d.tags,
        'comment_count', (SELECT COUNT(*) FROM comments c WHERE c.docket_id = d.id AND c.status = 'approved'),
        'created_at', d.created_at
      ))
      FROM dockets d
      WHERE d.agency_id = a.id
      AND d.status IN ('open', 'closed')
    ), '[]'::jsonb) AS dockets
  FROM
    agencies a
  WHERE
    a.slug = p_agency_slug
    AND a.deleted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION get_agency_public_profile TO anon, authenticated; 
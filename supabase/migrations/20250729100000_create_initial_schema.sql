-- 2025-07-29 10:00 Create Initial Schema

/* ----------------------------------------------------------------------
   1.  Enums
   ---------------------------------------------------------------------- */
CREATE TYPE agency_role AS ENUM ('owner', 'admin', 'reviewer', 'viewer');
CREATE TYPE docket_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');
CREATE TYPE moderation_action AS ENUM ('approve', 'reject', 'hide', 'unhide');

/* ----------------------------------------------------------------------
   2.  Tables
   ---------------------------------------------------------------------- */
CREATE TABLE agencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    jurisdiction text,
    slug text UNIQUE,
    description text,
    logo_url text,
    contact_email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE dockets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    summary text,
    slug text UNIQUE,
    status docket_status DEFAULT 'draft',
    open_at timestamptz,
    close_at timestamptz,
    comment_deadline timestamptz,
    tags text[],
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    content text,
    status comment_status DEFAULT 'pending',
    commenter_name text,
    commenter_organization text,
    comment_position text,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE,
    file_path text NOT NULL,
    file_type text,
    file_size integer,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE commenter_info (
    comment_id uuid PRIMARY KEY REFERENCES comments(id) ON DELETE CASCADE,
    representation text,
    city text,
    state text
);

CREATE TABLE docket_tags (
    docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE,
    tag_id uuid, -- We'll reference a future 'tags' table if needed
    PRIMARY KEY (docket_id, tag_id)
);

/* ----------------------------------------------------------------------
   3.  Functions
   ---------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION search_comments(
  p_query           text DEFAULT NULL,
  p_agency_name     text DEFAULT NULL,
  p_state           text DEFAULT NULL,
  p_tags            text[] DEFAULT NULL,
  p_date_from       timestamptz DEFAULT NULL,
  p_date_to         timestamptz DEFAULT NULL,
  p_commenter_type  text DEFAULT NULL,
  p_position        text DEFAULT NULL,
  p_sort_by         text DEFAULT 'newest',
  p_limit           integer DEFAULT 20,
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
  rank                   real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ts_query tsquery := CASE WHEN p_query IS NOT NULL AND trim(p_query) <> ''
                           THEN plainto_tsquery('english', p_query)
                           ELSE NULL END;
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    CASE WHEN ts_query IS NOT NULL
         THEN ts_headline('english', c.content, ts_query)
         ELSE LEFT(c.content,200) || CASE WHEN length(c.content) > 200 THEN '...' ELSE '' END
    END                                            AS snippet,
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
    CASE WHEN ts_query IS NOT NULL THEN ts_rank(c.search_vector, ts_query) ELSE 0 END AS rank
  FROM   comments        c
  JOIN   dockets         d  ON d.id = c.docket_id
  JOIN   agencies        a  ON a.id = d.agency_id
  LEFT   JOIN commenter_info ci ON ci.comment_id = c.id
  WHERE  c.status = 'approved'
    AND  d.status IN ('open','closed')
    AND  (ts_query IS NULL OR c.search_vector @@ ts_query)
    AND  (p_agency_name IS NULL OR a.name ILIKE '%'||p_agency_name||'%')
    AND  (p_state IS NULL OR a.jurisdiction ILIKE '%'||p_state||'%')
    AND  (p_tags IS NULL OR d.tags && p_tags)
    AND  (p_date_from IS NULL OR c.created_at >= p_date_from)
    AND  (p_date_to   IS NULL OR c.created_at <= p_date_to)
    AND  (p_commenter_type IS NULL OR COALESCE(ci.representation,'individual') = p_commenter_type)
    AND  (p_position IS NULL OR COALESCE(c.comment_position,'not_specified') = p_position)
  ORDER  BY
    CASE WHEN p_sort_by = 'newest' THEN c.created_at END DESC,
    CASE WHEN p_sort_by = 'oldest' THEN c.created_at END ASC,
    CASE WHEN p_sort_by = 'agency' THEN a.name END ASC,
    CASE WHEN p_sort_by = 'docket' THEN d.title END ASC,
    rank DESC
  LIMIT  p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION search_comments  TO anon, authenticated;

CREATE OR REPLACE FUNCTION get_comment_detail(p_comment_id uuid)
RETURNS TABLE(
  id uuid,
  content text,
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
  attachments jsonb,
  attachment_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT c.id, c.content, c.commenter_name, c.commenter_organization,
         COALESCE(ci.representation,'individual')           AS commenter_type,
         COALESCE(c.comment_position,'not_specified')       AS comment_position,
         c.created_at,
         d.id, d.title, d.slug,
         a.name, a.jurisdiction, d.tags,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('file_path', att.file_path)) FROM attachments att WHERE att.comment_id = c.id), '[]'::jsonb),
         (SELECT COUNT(*) FROM attachments WHERE comment_id = c.id)
  FROM   comments c
  JOIN   dockets  d ON d.id = c.docket_id
  JOIN   agencies a ON a.id = d.agency_id
  LEFT   JOIN commenter_info ci ON ci.comment_id = c.id
  WHERE  c.id = p_comment_id AND c.status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION get_comment_detail TO anon, authenticated;

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
        COALESCE(d.description, ''),
        d.summary,
        d.slug,
        d.status::text,
        d.open_at,
        d.close_at,
        d.tags,
        a.id,
        a.name,
        a.slug,
        a.jurisdiction,
        (SELECT COUNT(*) FROM comments c WHERE c.docket_id = d.id AND c.status = 'approved'),
        d.created_at,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'id', att.id,
            'filename', att.file_path,
            'file_url', att.file_path,
            'file_size', att.file_size,
            'mime_type', att.file_type
         )) FROM attachments att WHERE att.docket_id = d.id), '[]'::jsonb),
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'content', c.content,
            'commenter_name', c.commenter_name,
            'commenter_organization', c.commenter_organization,
            'created_at', c.created_at,
            'attachment_count', (SELECT COUNT(*) FROM attachments att WHERE att.comment_id = c.id)
        )) FROM comments c WHERE c.docket_id = d.id AND c.status = 'approved'), '[]'::jsonb)
    FROM
        dockets d
    JOIN
        agencies a ON d.agency_id = a.id
    WHERE
        d.slug = p_docket_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION get_docket_public_detail TO anon, authenticated;

CREATE OR REPLACE FUNCTION browse_public_dockets(
  p_query text DEFAULT NULL,
  p_agency_name text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_status text DEFAULT 'open',
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
    AND (p_agency_name IS NULL OR a.name ILIKE ('%' || p_agency_name || '%'))
    AND (p_state IS NULL OR a.jurisdiction ILIKE p_state)
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_date_from IS NULL OR d.created_at >= p_date_from)
    AND (p_date_to IS NULL OR d.created_at <= p_date_to)
    AND (p_query IS NULL OR d.search_vector @@ plainto_tsquery('english', p_query))
  ORDER BY
    CASE WHEN p_sort_by = 'newest' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'oldest' THEN d.created_at END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION browse_public_dockets TO anon, authenticated;


/* ----------------------------------------------------------------------
   4.  RLS Policies
   ---------------------------------------------------------------------- */
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read agencies" ON agencies FOR SELECT USING (true);
CREATE POLICY "Public can read open dockets" ON dockets FOR SELECT USING (status = 'open');
CREATE POLICY "Public can read approved comments" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create comments on open dockets" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (SELECT status FROM dockets WHERE id = docket_id) = 'open');

/* ----------------------------------------------------------------------
   5.  Seed Data
   ---------------------------------------------------------------------- */
INSERT INTO agencies (id,name,jurisdiction,slug)
VALUES ('00000000-0000-4000-8000-000000000001','Demo Agency','Demo State', 'demo-agency')
ON CONFLICT(id) DO NOTHING;

INSERT INTO dockets (id,agency_id,title,slug,status,tags,open_at,close_at,comment_deadline)
VALUES ('00000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000001',
        'Demo Docket','demo-docket','open',
        ARRAY['demo'], now(), now()+interval '30 days', now()+interval '30 days')
ON CONFLICT(id) DO NOTHING;

INSERT INTO comments (id,docket_id,content,status,commenter_name,created_at,comment_position)
VALUES ('00000000-0000-4000-8000-000000000003',
        '00000000-0000-4000-8000-000000000002',
        'Initial comment for search test','approved','Alice',now(), 'neutral')
ON CONFLICT(id) DO NOTHING; 
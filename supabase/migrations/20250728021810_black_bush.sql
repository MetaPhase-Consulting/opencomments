/*
  # Comprehensive Search Schema Fix
  
  1. Schema Updates
     - Fix comments table structure
     - Add missing columns and constraints
     - Create proper indexes for search
  
  2. Search Functions
     - Create working search_comments function
     - Add browse_public_dockets function
     - Add get_comment_detail function
  
  3. Data Integrity
     - Proper foreign keys and constraints
     - Search vector triggers
     - Performance indexes
*/

-- Drop existing problematic functions if they exist
DROP FUNCTION IF EXISTS search_comments(text, text, text, text[], timestamptz, timestamptz, text, boolean, text, text, integer, integer);
DROP FUNCTION IF EXISTS browse_public_dockets(text, text, text, text, text[], timestamptz, timestamptz, text, integer, integer);
DROP FUNCTION IF EXISTS get_comment_detail(uuid);

-- Ensure comments table has all required columns
DO $$
BEGIN
  -- Add submitter_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'submitter_name'
  ) THEN
    ALTER TABLE comments ADD COLUMN submitter_name text;
  END IF;

  -- Add organization if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'organization'
  ) THEN
    ALTER TABLE comments ADD COLUMN organization text;
  END IF;

  -- Add position if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'position'
  ) THEN
    ALTER TABLE comments ADD COLUMN position text CHECK (position IN ('support', 'oppose', 'neutral', 'unclear', 'not_specified'));
  END IF;

  -- Add body if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'body'
  ) THEN
    ALTER TABLE comments ADD COLUMN body text;
  END IF;
END $$;

-- Ensure agencies table has required columns
DO $$
BEGIN
  -- Add slug if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agencies' AND column_name = 'slug'
  ) THEN
    ALTER TABLE agencies ADD COLUMN slug text UNIQUE;
  END IF;

  -- Add contact_email if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agencies' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE agencies ADD COLUMN contact_email text;
  END IF;
END $$;

-- Ensure dockets table has required columns
DO $$
BEGIN
  -- Add slug if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dockets' AND column_name = 'slug'
  ) THEN
    ALTER TABLE dockets ADD COLUMN slug text UNIQUE;
  END IF;

  -- Add created_by if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dockets' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE dockets ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create docket_tags junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS docket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docket_id uuid REFERENCES dockets(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(docket_id, tag_id)
);

-- Create attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create search indexes
CREATE INDEX IF NOT EXISTS idx_comments_submitter_name ON comments(submitter_name);
CREATE INDEX IF NOT EXISTS idx_comments_organization ON comments(organization);
CREATE INDEX IF NOT EXISTS idx_comments_position ON comments(position);
CREATE INDEX IF NOT EXISTS idx_comments_body_search ON comments USING gin(to_tsvector('english', COALESCE(body, '')));
CREATE INDEX IF NOT EXISTS idx_comments_content_search ON comments USING gin(to_tsvector('english', COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS idx_dockets_title_search ON dockets USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_dockets_summary_search ON dockets USING gin(to_tsvector('english', COALESCE(summary, '')));
CREATE INDEX IF NOT EXISTS idx_agencies_name_search ON agencies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_dockets_slug ON dockets(slug);
CREATE INDEX IF NOT EXISTS idx_docket_tags_docket_id ON docket_tags(docket_id);
CREATE INDEX IF NOT EXISTS idx_docket_tags_tag_id ON docket_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_attachments_comment_id ON attachments(comment_id);

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
    c.content,
    CASE 
      WHEN length(c.content) > 200 THEN left(c.content, 200) || '...'
      ELSE c.content
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
      WHEN p_query IS NOT NULL THEN 
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
    AND d.status IN ('open', 'closed')
    AND (p_query IS NULL OR c.search_vector @@ plainto_tsquery('english', p_query))
    AND (p_agency_name IS NULL OR a.name ILIKE '%' || p_agency_name || '%')
    AND (p_state IS NULL OR a.jurisdiction ILIKE '%' || p_state || '%')
    AND (p_tags IS NULL OR d.tags && p_tags)
    AND (p_date_from IS NULL OR c.created_at >= p_date_from)
    AND (p_date_to IS NULL OR c.created_at <= p_date_to)
    AND (p_commenter_type IS NULL OR COALESCE(ci.representation, 'individual') = p_commenter_type)
    AND (p_position IS NULL OR COALESCE(c.position, 'not_specified') = p_position)
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
      WHEN p_query IS NOT NULL THEN ts_rank(c.search_vector, plainto_tsquery('english', p_query))
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create browse_public_dockets function
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
    COALESCE(d.summary, LEFT(d.description, 200) || '...') as summary,
    d.slug,
    d.status,
    d.open_at,
    d.close_at,
    COALESCE(
      ARRAY(
        SELECT t.name 
        FROM docket_tags dt 
        JOIN tags t ON t.id = dt.tag_id 
        WHERE dt.docket_id = d.id
      ), 
      ARRAY[]::text[]
    ) as tags,
    a.id as agency_id,
    a.name as agency_name,
    a.slug as agency_slug,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(
      (SELECT COUNT(*) FROM comments c WHERE c.docket_id = d.id AND c.status = 'published'), 
      0
    ) as comment_count,
    d.created_at,
    CASE 
      WHEN p_query IS NOT NULL AND p_query != '' THEN
        ts_rank(
          to_tsvector('english', d.title || ' ' || COALESCE(d.summary, d.description, '')),
          plainto_tsquery('english', p_query)
        )
      ELSE 0.5
    END as rank
  FROM dockets d
  JOIN agencies a ON a.id = d.agency_id
  WHERE 
    (p_status IS NULL OR d.status = p_status)
    AND (p_query IS NULL OR p_query = '' OR 
         to_tsvector('english', d.title || ' ' || COALESCE(d.summary, d.description, '')) @@ plainto_tsquery('english', p_query))
    AND (p_agency_name IS NULL OR a.name ILIKE '%' || p_agency_name || '%')
    AND (p_state IS NULL OR a.jurisdiction ILIKE '%' || p_state || '%')
    AND (p_date_from IS NULL OR d.open_at >= p_date_from)
    AND (p_date_to IS NULL OR d.close_at <= p_date_to)
    AND (p_tags IS NULL OR EXISTS(
      SELECT 1 FROM docket_tags dt 
      JOIN tags t ON t.id = dt.tag_id 
      WHERE dt.docket_id = d.id AND t.name = ANY(p_tags)
    ))
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'newest' THEN d.created_at
      WHEN p_sort_by = 'closing' THEN d.close_at
      ELSE d.created_at
    END DESC,
    CASE 
      WHEN p_sort_by = 'title' THEN d.title
      WHEN p_sort_by = 'agency' THEN a.name
      ELSE NULL
    END ASC
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
    COALESCE(c.content, c.body, '') as content,
    COALESCE(c.commenter_name, c.submitter_name) as commenter_name,
    c.commenter_email,
    COALESCE(c.commenter_organization, c.organization) as commenter_organization,
    CASE 
      WHEN c.commenter_name IS NULL AND c.submitter_name IS NULL THEN 'anonymous'
      WHEN c.commenter_organization IS NOT NULL OR c.organization IS NOT NULL THEN 'organization'
      ELSE 'individual'
    END as commenter_type,
    COALESCE(c.commenter_organization, c.organization) as organization_name,
    '' as authorization_statement,
    COALESCE(c.position, 'not_specified') as position,
    c.created_at,
    d.id as docket_id,
    d.title as docket_title,
    d.slug as docket_slug,
    d.description as docket_description,
    a.name as agency_name,
    a.jurisdiction as agency_jurisdiction,
    COALESCE(
      ARRAY(
        SELECT t.name 
        FROM docket_tags dt 
        JOIN tags t ON t.id = dt.tag_id 
        WHERE dt.docket_id = d.id
      ), 
      ARRAY[]::text[]
    ) as tags,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', att.id,
            'filename', att.filename,
            'file_url', att.file_url,
            'file_size', att.file_size,
            'mime_type', att.mime_type
          )
        )
        FROM attachments att 
        WHERE att.comment_id = c.id
      ),
      '[]'::jsonb
    ) as attachments
  FROM comments c
  JOIN dockets d ON d.id = c.docket_id
  JOIN agencies a ON a.id = d.agency_id
  WHERE 
    c.id = p_comment_id
    AND c.status = 'published'
    AND d.status IN ('open', 'closed');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION browse_public_dockets TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comment_detail TO anon, authenticated;
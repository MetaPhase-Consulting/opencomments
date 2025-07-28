/*
  # Seed Schema Sync Migration
  
  1. Schema Updates
     - Add missing columns for public browsing
     - Ensure proper constraints and indexes
     - Add agency slug generation
  
  2. Data Types
     - Position enum for comments
     - Status constraints
     - Proper indexing for search
*/

-- Add missing columns to agencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'slug'
  ) THEN
    ALTER TABLE agencies ADD COLUMN slug text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE agencies ADD COLUMN contact_email text;
  END IF;
END $$;

-- Add missing columns to dockets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dockets' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE dockets ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Add missing columns to comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'submitter_name'
  ) THEN
    ALTER TABLE comments ADD COLUMN submitter_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'organization'
  ) THEN
    ALTER TABLE comments ADD COLUMN organization text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'position'
  ) THEN
    ALTER TABLE comments ADD COLUMN position text CHECK (position IN ('support', 'oppose', 'neutral', 'unclear', 'not_specified'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'body'
  ) THEN
    ALTER TABLE comments ADD COLUMN body text;
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

-- Add unique constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'agencies' AND constraint_name = 'agencies_slug_key'
  ) THEN
    ALTER TABLE agencies ADD CONSTRAINT agencies_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_dockets_slug ON dockets(slug);
CREATE INDEX IF NOT EXISTS idx_dockets_status_public ON dockets(status) WHERE status IN ('open', 'closed', 'archived');
CREATE INDEX IF NOT EXISTS idx_comments_status_approved ON comments(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_comments_position ON comments(position);
CREATE INDEX IF NOT EXISTS idx_docket_tags_docket_id ON docket_tags(docket_id);
CREATE INDEX IF NOT EXISTS idx_docket_tags_tag_id ON docket_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_attachments_comment_id ON attachments(comment_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_dockets_title_search ON dockets USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_dockets_summary_search ON dockets USING gin(to_tsvector('english', COALESCE(summary, '')));
CREATE INDEX IF NOT EXISTS idx_comments_body_search ON comments USING gin(to_tsvector('english', COALESCE(body, '')));
CREATE INDEX IF NOT EXISTS idx_agencies_name_search ON agencies USING gin(to_tsvector('english', name));

-- Function to generate agency slug
CREATE OR REPLACE FUNCTION generate_agency_slug(agency_name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(agency_name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Update existing agencies to have slugs
UPDATE agencies 
SET slug = generate_agency_slug(name) 
WHERE slug IS NULL;

-- Function to generate docket slug
CREATE OR REPLACE FUNCTION generate_docket_slug(docket_title text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(docket_title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Update existing dockets to have slugs
UPDATE dockets 
SET slug = generate_docket_slug(title) 
WHERE slug IS NULL;
/*
  # Seed Reference Data

  1. Docket Tags
    - Common topic categories for government dockets
    
  2. File Type Whitelist
    - Allowed MIME types for uploads
    
  3. Default Agency Settings
    - Template configuration options
*/

-- Insert predefined docket tags
INSERT INTO docket_tags (name, description, color) VALUES
  ('Budget', 'Budget proposals and financial planning', '#10B981'),
  ('Transportation', 'Roads, transit, and transportation infrastructure', '#3B82F6'),
  ('Housing', 'Housing policy and development', '#8B5CF6'),
  ('Environment', 'Environmental protection and sustainability', '#059669'),
  ('Public Safety', 'Police, fire, emergency services', '#DC2626'),
  ('Parks & Recreation', 'Parks, recreation facilities, and programs', '#65A30D'),
  ('Zoning', 'Land use and zoning regulations', '#D97706'),
  ('Economic Development', 'Business development and economic policy', '#7C3AED'),
  ('Health', 'Public health and healthcare services', '#DB2777'),
  ('Education', 'Schools and educational programs', '#2563EB'),
  ('Utilities', 'Water, sewer, electricity, and utilities', '#0891B2'),
  ('Technology', 'IT infrastructure and digital services', '#7C2D12')
ON CONFLICT (name) DO NOTHING;

-- Create a reference table for allowed file types
CREATE TABLE IF NOT EXISTS allowed_file_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extension text UNIQUE NOT NULL,
  mime_type text NOT NULL,
  description text NOT NULL,
  max_size_mb integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert allowed file types
INSERT INTO allowed_file_types (extension, mime_type, description, max_size_mb) VALUES
  ('pdf', 'application/pdf', 'PDF Documents', 25),
  ('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Word Documents (DOCX)', 10),
  ('doc', 'application/msword', 'Word Documents (DOC)', 10),
  ('txt', 'text/plain', 'Plain Text Files', 5),
  ('rtf', 'application/rtf', 'Rich Text Format', 5),
  ('jpg', 'image/jpeg', 'JPEG Images', 15),
  ('jpeg', 'image/jpeg', 'JPEG Images', 15),
  ('png', 'image/png', 'PNG Images', 15),
  ('gif', 'image/gif', 'GIF Images', 10),
  ('webp', 'image/webp', 'WebP Images', 10),
  ('csv', 'text/csv', 'CSV Spreadsheets', 5),
  ('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Excel Spreadsheets', 10)
ON CONFLICT (extension) DO NOTHING;

-- Enable RLS on reference tables
ALTER TABLE allowed_file_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reference data
CREATE POLICY "Anyone can read docket tags"
  ON docket_tags
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read allowed file types"
  ON allowed_file_types
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Create indexes for reference tables
CREATE INDEX IF NOT EXISTS idx_docket_tags_name ON docket_tags(name);
CREATE INDEX IF NOT EXISTS idx_allowed_file_types_extension ON allowed_file_types(extension);
CREATE INDEX IF NOT EXISTS idx_allowed_file_types_active ON allowed_file_types(is_active);
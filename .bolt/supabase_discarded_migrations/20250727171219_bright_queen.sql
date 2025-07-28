/*
  # Seed Reference Data

  1. Tags
    - Insert predefined topic tags with colors and descriptions
  
  2. Sample Data
    - Create sample agency and users for testing
*/

-- Insert predefined tags
INSERT INTO tags (name, description, color) VALUES
  ('Budget', 'Financial planning and budget proposals', '#10B981'),
  ('Transportation', 'Roads, transit, and mobility planning', '#3B82F6'),
  ('Housing', 'Residential development and housing policy', '#8B5CF6'),
  ('Environment', 'Environmental protection and sustainability', '#059669'),
  ('Public Safety', 'Police, fire, and emergency services', '#DC2626'),
  ('Parks & Recreation', 'Parks, facilities, and recreational programs', '#65A30D'),
  ('Zoning', 'Land use and zoning regulations', '#D97706'),
  ('Economic Development', 'Business development and economic policy', '#7C3AED'),
  ('Health', 'Public health and healthcare services', '#DB2777'),
  ('Education', 'Schools and educational programs', '#2563EB'),
  ('Infrastructure', 'Utilities, roads, and public works', '#374151'),
  ('Community Development', 'Neighborhood and community programs', '#F59E0B')
ON CONFLICT (name) DO NOTHING;
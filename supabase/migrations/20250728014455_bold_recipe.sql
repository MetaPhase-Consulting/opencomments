/*
  # Add additional comment search data

  1. New Columns
    - Add position field to comments table
    - Update search vectors for better search

  2. Sample Data
    - Add more realistic comment data with positions
    - Add commenter_info records for representation types

  3. Indexes
    - Additional indexes for search performance
*/

-- Add position column to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'position'
  ) THEN
    ALTER TABLE comments ADD COLUMN position text;
  END IF;
END $$;

-- Update existing comments with position data
UPDATE comments SET position = 'support' WHERE id IN (
  SELECT id FROM comments WHERE content ILIKE '%support%' OR content ILIKE '%favor%' OR content ILIKE '%agree%' LIMIT 5
);

UPDATE comments SET position = 'oppose' WHERE id IN (
  SELECT id FROM comments WHERE content ILIKE '%oppose%' OR content ILIKE '%against%' OR content ILIKE '%disagree%' LIMIT 3
);

UPDATE comments SET position = 'neutral' WHERE id IN (
  SELECT id FROM comments WHERE position IS NULL LIMIT 2
);

-- Add commenter_info records for some comments
INSERT INTO commenter_info (comment_id, representation, organization_name, perjury_certified)
SELECT 
  c.id,
  CASE 
    WHEN c.commenter_organization IS NOT NULL THEN 'organization'
    ELSE 'myself'
  END,
  c.commenter_organization,
  true
FROM comments c
WHERE NOT EXISTS (
  SELECT 1 FROM commenter_info ci WHERE ci.comment_id = c.id
)
LIMIT 10;

-- Add more diverse comments for better search testing
INSERT INTO comments (
  docket_id, 
  user_id, 
  content, 
  status, 
  commenter_name, 
  commenter_email, 
  commenter_organization,
  position,
  created_at
) VALUES 
-- Additional comments for Downtown Bike Lane Expansion
(
  (SELECT id FROM dockets WHERE title = 'Downtown Bike Lane Expansion'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'As a daily cyclist and Springfield resident, I strongly support the proposed bike lane expansion. The current infrastructure is inadequate and dangerous. Protected bike lanes will encourage more people to cycle, reducing traffic congestion and improving air quality. I urge the city to prioritize cyclist safety and approve this proposal immediately.',
  'published',
  'Maria Rodriguez',
  'maria.r@email.com',
  'Springfield Cycling Advocacy Group',
  'support',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM dockets WHERE title = 'Downtown Bike Lane Expansion'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'While I appreciate the environmental benefits of cycling, I am concerned about the impact on parking availability for local businesses. Many of my customers rely on street parking, and removing these spaces could hurt our revenue. Please consider alternative routes that do not eliminate existing parking.',
  'published',
  'Robert Chen',
  'robert@downtownbiz.com',
  'Downtown Business Association',
  'oppose',
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM dockets WHERE title = 'Downtown Bike Lane Expansion'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'I support bike lanes in principle but have concerns about the proposed design. The lanes should be physically separated from traffic, not just painted lines. Also, please ensure adequate lighting and snow removal plans for year-round usability.',
  'published',
  'Jennifer Walsh',
  'j.walsh@email.com',
  NULL,
  'neutral',
  NOW() - INTERVAL '3 hours'
),

-- Additional comments for Budget Review
(
  (SELECT id FROM dockets WHERE title = 'FY 2025 Municipal Budget Review'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'The proposed budget allocates insufficient funds for public education. Our schools are overcrowded and understaffed. I urge the council to increase education funding by at least 15% and reduce spending on non-essential projects.',
  'published',
  'Dr. Patricia Williams',
  'p.williams@springfield.edu',
  'Springfield Teachers Union',
  'oppose',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id FROM dockets WHERE title = 'FY 2025 Municipal Budget Review'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'I appreciate the focus on infrastructure improvements in this budget. The road repair allocation is long overdue. However, I would like to see more funding for public transportation to reduce our carbon footprint and provide better service to low-income residents.',
  'published',
  'Michael Thompson',
  'mthompson@email.com',
  'Environmental Action Coalition',
  'support',
  NOW() - INTERVAL '4 days'
),

-- Additional comments for Zoning Amendment
(
  (SELECT id FROM dockets WHERE title = 'Riverside District Zoning Amendment'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'This zoning change will destroy the character of our historic neighborhood. High-density development is inappropriate for this area and will strain our already limited parking and infrastructure. Please preserve the current zoning restrictions.',
  'published',
  'Eleanor Martinez',
  'e.martinez@email.com',
  'Riverside Neighborhood Association',
  'oppose',
  NOW() - INTERVAL '8 days'
),
(
  (SELECT id FROM dockets WHERE title = 'Riverside District Zoning Amendment'),
  (SELECT id FROM profiles WHERE email = 'test@springfield.gov'),
  'Springfield needs more affordable housing options, and this zoning amendment is a step in the right direction. The proposed density increases will help address our housing shortage while maintaining neighborhood character through design guidelines.',
  'published',
  'David Kim',
  'dkim@affordablehousing.org',
  'Springfield Housing Coalition',
  'support',
  NOW() - INTERVAL '7 days'
);

-- Update search vectors for all comments
UPDATE comments SET search_vector = 
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(commenter_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(commenter_organization, '')), 'C')
WHERE search_vector IS NULL;

-- Create additional indexes for search performance
CREATE INDEX IF NOT EXISTS idx_comments_position ON comments(position);
CREATE INDEX IF NOT EXISTS idx_comments_commenter_org ON comments(commenter_organization);
CREATE INDEX IF NOT EXISTS idx_commenter_info_representation ON commenter_info(representation);
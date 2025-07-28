/*
  # Seed Test Data for OpenComments

  1. Test Agency
    - Creates a sample government agency
    - Sets up agency settings and configuration

  2. Test Dockets
    - Creates multiple dockets with different statuses and topics
    - Includes various comment deadlines and settings

  3. Test Comments
    - Creates realistic public comments with different statuses
    - Includes comments from various types of users and organizations
    - Ensures enough data for pagination testing (15+ comments)

  4. Supporting Data
    - Docket tags and attachments
    - Comment attachments where appropriate
*/

-- Create test agency
INSERT INTO agencies (
  id,
  name,
  jurisdiction,
  jurisdiction_type,
  description,
  contact_email,
  public_slug,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'City of Springfield',
  'Springfield, IL',
  'city',
  'The City of Springfield is committed to transparent governance and meaningful public participation in local decision-making.',
  'clerk@springfield.gov',
  'springfield',
  now() - interval '6 months',
  now() - interval '1 month'
) ON CONFLICT (id) DO NOTHING;

-- Create agency settings
INSERT INTO agency_settings (
  agency_id,
  max_file_size_mb,
  allowed_mime_types,
  captcha_enabled,
  auto_publish,
  accent_color,
  footer_disclaimer,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  10,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  true,
  false,
  '#0050D8',
  'All comments become part of the public record and are subject to Illinois Freedom of Information Act.',
  now() - interval '6 months',
  now() - interval '1 month'
) ON CONFLICT (agency_id) DO NOTHING;

-- Create test dockets
INSERT INTO dockets (
  id,
  agency_id,
  title,
  description,
  summary,
  slug,
  reference_code,
  tags,
  status,
  comment_deadline,
  open_at,
  close_at,
  auto_publish,
  require_captcha,
  max_file_size_mb,
  allowed_file_types,
  max_comment_length,
  max_comments_per_user,
  uploads_enabled,
  max_files_per_comment,
  allowed_mime_types,
  created_at,
  updated_at
) VALUES 
-- Docket 1: Open Transportation Project
(
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Downtown Bike Lane Expansion Project',
  'The City of Springfield is proposing to expand the downtown bike lane network to improve cyclist safety and encourage sustainable transportation. The project includes protected bike lanes on Main Street, Oak Avenue, and Elm Street, with new bike parking facilities and improved intersection designs. We are seeking public input on the proposed routes, safety measures, and potential impacts on parking and traffic flow.',
  'Proposed expansion of downtown bike lanes with protected lanes on three major streets. Public input sought on routes, safety measures, and traffic impacts.',
  'downtown-bike-lanes-2024',
  'TRANS-2024-001',
  ARRAY['Transportation', 'Environment', 'Public Safety'],
  'open',
  now() + interval '30 days',
  now() - interval '15 days',
  now() + interval '30 days',
  false,
  true,
  10,
  ARRAY['pdf', 'docx', 'jpg', 'png'],
  4000,
  3,
  true,
  3,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  now() - interval '15 days',
  now() - interval '1 day'
),
-- Docket 2: Open Budget Review
(
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'FY 2025 Municipal Budget Public Review',
  'The City of Springfield presents the proposed Fiscal Year 2025 municipal budget for public review and comment. The $45.2 million budget includes funding for essential city services, infrastructure improvements, and new community programs. Key highlights include increased funding for public safety, park maintenance, and affordable housing initiatives. The budget also proposes a modest property tax increase to fund critical infrastructure repairs. Citizens are encouraged to review the detailed budget documents and provide feedback on spending priorities and proposed tax changes.',
  'Review and comment on Springfield''s proposed $45.2M budget for FY 2025, including public safety, infrastructure, and housing investments.',
  'fy2025-budget-review',
  'BUDGET-2025-001',
  ARRAY['Budget', 'Public Safety', 'Housing'],
  'open',
  now() + interval '45 days',
  now() - interval '10 days',
  now() + interval '45 days',
  false,
  true,
  10,
  ARRAY['pdf', 'docx', 'jpg', 'png'],
  4000,
  3,
  true,
  3,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  now() - interval '10 days',
  now() - interval '2 days'
),
-- Docket 3: Closed Zoning Change
(
  'd3a2b3c4-e5f6-7890-abcd-ef1234567893',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Riverside District Zoning Amendment',
  'Proposed amendment to the Riverside District zoning ordinance to allow mixed-use development along the Springfield River waterfront. The amendment would permit residential, commercial, and light industrial uses in the current industrial-only zone. This change aims to revitalize the waterfront area while preserving environmental protections and public river access. The proposal includes height restrictions, setback requirements, and mandatory green space provisions.',
  'Zoning amendment to allow mixed-use development in Riverside District waterfront area with environmental protections.',
  'riverside-zoning-amendment',
  'ZONING-2024-003',
  ARRAY['Zoning', 'Economic Development', 'Environment'],
  'closed',
  now() - interval '5 days',
  now() - interval '60 days',
  now() - interval '5 days',
  false,
  true,
  10,
  ARRAY['pdf', 'docx', 'jpg', 'png'],
  4000,
  3,
  true,
  3,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
  now() - interval '60 days',
  now() - interval '5 days'
);

-- Create test comments for Docket 1 (Bike Lanes)
INSERT INTO comments (
  id,
  docket_id,
  user_id,
  content,
  status,
  commenter_name,
  commenter_email,
  commenter_organization,
  created_at,
  updated_at
) VALUES 
(
  'c1a2b3c4-e5f6-7890-abcd-ef1234567891',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'I strongly support the downtown bike lane expansion. As a daily cyclist commuting to work, I currently feel unsafe sharing the road with cars on Main Street. Protected bike lanes would make cycling a viable option for more residents and reduce traffic congestion. Please ensure the lanes are properly separated from vehicle traffic and include clear signage.',
  'published',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  null,
  now() - interval '12 days',
  now() - interval '11 days'
),
(
  'c2a2b3c4-e5f6-7890-abcd-ef1234567892',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'While I appreciate the environmental benefits of cycling, I am concerned about the loss of parking spaces on Main Street. Local businesses depend on street parking for customers. Has the city considered alternative routes that would not impact commercial parking? Perhaps Oak Avenue would be a better choice for the main bike corridor.',
  'published',
  'Michael Chen',
  'mchen@springfieldchamber.org',
  'Springfield Chamber of Commerce',
  now() - interval '11 days',
  now() - interval '10 days'
),
(
  'c3a2b3c4-e5f6-7890-abcd-ef1234567893',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'The bike lane proposal is excellent for promoting healthy transportation options. However, I urge the city to include better lighting along the proposed routes for evening safety. Also, please ensure the bike lanes connect properly to existing trails in Lincoln Park.',
  'published',
  'Dr. Lisa Rodriguez',
  'lrodriguez@springfieldhospital.org',
  'Springfield General Hospital',
  now() - interval '10 days',
  now() - interval '9 days'
),
(
  'c4a2b3c4-e5f6-7890-abcd-ef1234567894',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'As a parent of two young children, I am thrilled about the bike lane expansion. It would allow our family to safely bike to school and downtown events. Please include family-friendly features like wider lanes to accommodate bike trailers and cargo bikes.',
  'published',
  'Jennifer Adams',
  'jadams@email.com',
  null,
  now() - interval '9 days',
  now() - interval '8 days'
),
(
  'c5a2b3c4-e5f6-7890-abcd-ef1234567895',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'I oppose this project due to the negative impact on vehicle traffic flow. Main Street is already congested during rush hours, and removing a traffic lane will make the situation worse. The city should focus on improving public transit instead of catering to a small group of cyclists.',
  'published',
  'Robert Thompson',
  'rthompson@email.com',
  null,
  now() - interval '8 days',
  now() - interval '7 days'
),
(
  'c6a2b3c4-e5f6-7890-abcd-ef1234567896',
  'd1a2b3c4-e5f6-7890-abcd-ef1234567891',
  gen_random_uuid(),
  'The Springfield Cycling Club fully endorses this proposal. We have been advocating for safe cycling infrastructure for years. The protected bike lanes will encourage more people to choose cycling for transportation, reducing emissions and improving public health. We volunteer to help with community education about bike lane etiquette.',
  'published',
  'David Park',
  'president@springfieldcycling.org',
  'Springfield Cycling Club',
  now() - interval '7 days',
  now() - interval '6 days'
);

-- Create test comments for Docket 2 (Budget)
INSERT INTO comments (
  id,
  docket_id,
  user_id,
  content,
  status,
  commenter_name,
  commenter_email,
  commenter_organization,
  created_at,
  updated_at
) VALUES 
(
  'c7a2b3c4-e5f6-7890-abcd-ef1234567897',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'I support the increased funding for public safety, but I am concerned about the proposed property tax increase. Many residents are already struggling with rising costs. Has the city explored other revenue sources, such as fees for new developments or grants for infrastructure projects?',
  'published',
  'Maria Gonzalez',
  'mgonzalez@email.com',
  null,
  now() - interval '8 days',
  now() - interval '7 days'
),
(
  'c8a2b3c4-e5f6-7890-abcd-ef1234567898',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'The budget allocation for affordable housing is insufficient given the current housing crisis. The city should prioritize housing assistance and development incentives over other discretionary spending. I recommend increasing the housing budget by at least $2 million.',
  'published',
  'James Wilson',
  'jwilson@springfieldhousing.org',
  'Springfield Housing Authority',
  now() - interval '7 days',
  now() - interval '6 days'
),
(
  'c9a2b3c4-e5f6-7890-abcd-ef1234567899',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'As a small business owner, I appreciate the city''s focus on economic development. However, the budget should include more support for local businesses, such as facade improvement grants and marketing assistance. These investments would generate tax revenue and create jobs.',
  'published',
  'Patricia Lee',
  'plee@springfieldsmallbiz.org',
  'Springfield Small Business Association',
  now() - interval '6 days',
  now() - interval '5 days'
),
(
  'c10a2b3c4-e5f6-7890-abcd-ef123456789a',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'The parks and recreation budget seems adequate, but I urge the city to prioritize accessibility improvements in all public facilities. Many of our parks and community centers are not fully accessible to residents with disabilities.',
  'published',
  'Thomas Anderson',
  'tanderson@email.com',
  null,
  now() - interval '5 days',
  now() - interval '4 days'
),
(
  'c11a2b3c4-e5f6-7890-abcd-ef123456789b',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'I strongly oppose any property tax increase. The city needs to find efficiencies in current operations before asking residents to pay more. Consider consolidating departments, reducing administrative overhead, and renegotiating vendor contracts.',
  'published',
  'Nancy Brown',
  'nbrown@email.com',
  null,
  now() - interval '4 days',
  now() - interval '3 days'
),
(
  'c12a2b3c4-e5f6-7890-abcd-ef123456789c',
  'd2a2b3c4-e5f6-7890-abcd-ef1234567892',
  gen_random_uuid(),
  'The environmental sustainability initiatives in the budget are commendable. I particularly support the funding for solar panels on city buildings and the electric vehicle charging stations. These investments will save money long-term and demonstrate environmental leadership.',
  'published',
  'Dr. Kevin Martinez',
  'kmartinez@springfieldenviron.org',
  'Springfield Environmental Coalition',
  now() - interval '3 days',
  now() - interval '2 days'
);

-- Create test comments for Docket 3 (Zoning)
INSERT INTO comments (
  id,
  docket_id,
  user_id,
  content,
  status,
  commenter_name,
  commenter_email,
  commenter_organization,
  created_at,
  updated_at
) VALUES 
(
  'c13a2b3c4-e5f6-7890-abcd-ef123456789d',
  'd3a2b3c4-e5f6-7890-abcd-ef1234567893',
  gen_random_uuid(),
  'The Riverside District zoning amendment is a positive step toward waterfront revitalization. However, the height restrictions should be more stringent to preserve river views for existing residents. I recommend limiting buildings to 4 stories maximum.',
  'published',
  'Elizabeth Taylor',
  'etaylor@email.com',
  null,
  now() - interval '45 days',
  now() - interval '40 days'
),
(
  'c14a2b3c4-e5f6-7890-abcd-ef123456789e',
  'd3a2b3c4-e5f6-7890-abcd-ef1234567893',
  gen_random_uuid(),
  'This zoning change will bring much-needed economic development to the Riverside area. The mixed-use approach is smart and will create a vibrant community. Please ensure adequate parking is required for new developments to avoid spillover into residential neighborhoods.',
  'published',
  'Charles Davis',
  'cdavis@riversidedevelopment.com',
  'Riverside Development Group',
  now() - interval '40 days',
  now() - interval '35 days'
),
(
  'c15a2b3c4-e5f6-7890-abcd-ef123456789f',
  'd3a2b3c4-e5f6-7890-abcd-ef1234567893',
  gen_random_uuid(),
  'I am concerned about the environmental impact of increased development along the river. The amendment should include stronger protections for wetlands and wildlife habitats. Any new construction should be required to include green infrastructure for stormwater management.',
  'published',
  'Dr. Amanda Foster',
  'afoster@springfielduniversity.edu',
  'Springfield University Environmental Science Department',
  now() - interval '35 days',
  now() - interval '30 days'
);

-- Update search vectors for all dockets
UPDATE dockets SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(summary, '')), 'B') ||
  setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C')
WHERE agency_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Update search vectors for all comments
UPDATE comments SET search_vector = 
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(commenter_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(commenter_organization, '')), 'C')
WHERE docket_id IN (
  SELECT id FROM dockets WHERE agency_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);